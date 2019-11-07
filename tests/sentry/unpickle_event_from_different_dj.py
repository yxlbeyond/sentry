import pickle

import django

from sentry.testutils import TestCase
from sentry.testutils.helpers.datetime import iso_format, before_now

class UnpickleEventFromDifferentDjango(TestCase):
    def test_simple(self):
        project = self.create_project()

        event = self.store_event(
            data={
                "event_id": "a" * 32,
                "timestamp": iso_format(before_now(minutes=1)),
                "fingerprint": ["foobar"],
            },
            project_id=project.id,
        )

        target_dj_version = {
            "1.8": "1.9",
            "1.9": "1.8",
        }

        event_from_target_dj = None
        with open("event-" + target_dj_version[".".join(map(str, django.VERSION[:2]))] + ".pickle", "rb") as f:
            event_from_target_dj = pickle.load(f)

        assert event == event_from_target_dj
