# NOTE: This is run external to sentry as well as part of the setup
# process.  Thus we do not want to import non stdlib things here.
from __future__ import absolute_import

import os
import sys
import json
from distutils import log

import sentry


SDK_REGISTRY_URL = 'https://release-registry.services.sentry.io/sdks'
JS_SDK_REGISTRY_URL = 'https://release-registry.services.sentry.io/sdks/sentry.javascript.browser/versions'
LOADER_FOLDER = os.path.abspath(os.path.join(os.path.dirname(sentry.__file__), 'loader'))
SDK_REGISTRY_FOLDER = os.path.abspath(
    os.path.join(
        os.path.dirname(
            sentry.__file__),
        'sdk_registry'))

# We cannot leverage six here, so we need to vendor
# bits that we need.
if sys.version_info[0] == 3:

    def iteritems(d, **kw):
        return iter(d.items(**kw))

    from urllib.request import urlopen

else:

    def iteritems(d, **kw):
        return d.iteritems(**kw)  # NOQA

    from urllib2 import urlopen


def dump_registry_data(base_folder, path, data):
    """
    Dump the given data as JSON into `base_folder/path.json`
    """
    filepath = os.path.join(base_folder, path + '.json')
    directory = os.path.dirname(filepath)
    try:
        os.makedirs(directory)
    except OSError:  # directory already exists
        pass
    with open(filepath, 'wb') as dump_file:
        json.dump(data, dump_file, indent=2)
        dump_file.write('\n')


def sync_with_release_registry():
    """
    Pull current data from the release registry API and dump it to disk.

    Currently pulls:
        - latest version of all unified SDK's (for marking event SDK
          as outdated if applicable)
        - full list of sentry.javascript.browser versions (for the loader)
    """
    to_sync = [
        # (API URL, destination folder)
        (SDK_REGISTRY_URL, SDK_REGISTRY_FOLDER),
        (JS_SDK_REGISTRY_URL, LOADER_FOLDER),
    ]
    for url, folder in to_sync:
        body = urlopen(url).read().decode('utf-8')
        data = json.loads(body)
        dump_registry_data(folder, '_registry', data)


from .base import BaseBuildCommand


class SyncWithReleaseRegistryCommand(BaseBuildCommand):
    description = 'harvest data from release registry and dump it to disk'

    def run(self):
        log.info('downloading SDK information from the release registry')
        try:
            sync_with_release_registry()
        except BaseException:
            log.error('error ocurred while trying to fetch sdk information from the registry')
