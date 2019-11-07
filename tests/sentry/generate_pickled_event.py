import pickle

import django

from sentry.testutils import TestCase
from sentry.testutils.helpers.datetime import iso_format, before_now

class GeneratePickledEvent(TestCase):
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

        with open("event-" + ".".join(map(str, django.VERSION[:2])) + ".pickle", "wb") as f:
            pickle.dump(event, f)
