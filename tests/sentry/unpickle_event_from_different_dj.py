import pickle

import django
from django.forms.models import model_to_dict

from sentry.testutils import TestCase
from sentry.testutils.helpers.datetime import iso_format, before_now

class UnpickleEventFromDifferentDjango(TestCase):
    def test_simple(self):
        project = self.create_project()

        event = self.store_event(
            data={
                "event_id": "a" * 32,
                # XXX: store_event doesn't really like datetime.fromtimestamp(0) or similar
                "timestamp": iso_format(before_now(minutes=1)),
                "fingerprint": ["foobar"],
            },
            project_id=project.id,
        )

        target_dj_version = {
            "1.9": "1.10",
            "1.10": "1.9",
        }

        event_from_target_dj = None
        with open("event-" + target_dj_version[".".join(map(str, django.VERSION[:2]))] + ".pickle", "rb") as f:
            event_from_target_dj = pickle.load(f)

        event_data = model_to_dict(event)
        event_from_target_dj_data = model_to_dict(event_from_target_dj)

        event_data.pop("datetime")
        event_from_target_dj_data.pop("datetime")
        event_data["data"].pop("received")
        event_from_target_dj_data["data"].pop("received")
        event_data["data"].pop("timestamp")
        event_from_target_dj_data["data"].pop("timestamp")

        assert event_data == event_from_target_dj_data
