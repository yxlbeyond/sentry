from __future__ import absolute_import


try:
    # TODO: remove when we drop Python 2.7 compat
    import mock
except ImportError:
    from unittest import mock


from sentry.plugins.bases.notify import NotificationPlugin
from sentry.testutils import PluginTestCase
from sentry.models import Activity


class BasicPreprocessorPlugin(NotificationPlugin):
    def notify_about_activity(self, activity):
        pass

    def is_enabled(self, project=None):
        return True


class ActivityNotificationsTest(PluginTestCase):
    plugin = BasicPreprocessorPlugin

    @mock.patch("sentry.tasks.activity.send_activity_notifications")
    def test_simple(self, mock_func):
        group = self.create_group()

        activity = Activity.objects.create(
            project=group.project,
            group=group,
            type=Activity.ASSIGNED,
            user=self.user,
            data={"assignee": None},
        )
        activity.send_notification()

        assert mock_func.delay.call_count == 1
