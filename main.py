#!/usr/bin/env python

import boto3
from flask import Flask, jsonify, send_from_directory
import memcache
import logging

image_list_cache_time = 300
repo_list_cache_time  = 600

app = Flask(__name__, static_url_path='/')

client = boto3.client('ecr')

mc = memcache.Client(['127.0.0.1:11211'], debug=0)


@app.route('/api/v1.0/<string:registry_id>/repositories', methods=['GET'])
def get_tasks(registry_id):
    app.logger.info('Listing repositories under registry_id={0}'.format(registry_id))
    return get_repositories(registry_id)


@app.route('/api/v1.0/<string:registry_id>/repository/<path:repository_name>', methods=['GET'])
def get_task(registry_id, repository_name):
    return list_repository(registry_id, repository_name)


@app.route('/static/<path:path>')
def send_template(path):
    return send_from_directory('static/', path)


@app.route('/')
def root():
    return app.send_static_file('index.html')


def get_repositories(registry_id):

    json_response = mc.get('repositories')

    if not json_response:
        app.logger.info("cache miss repositories")
        paginator = client.get_paginator('describe_repositories')
        page_iterator = paginator.paginate(registryId=registry_id)

        response = {'repositories': []}

        for page in page_iterator:
            response['repositories'].extend(page['repositories'])

        json_response = jsonify(response)

        mc.set('repositories', json_response, repo_list_cache_time)
    else:
        app.logger.info("cache hit repositories")

    return json_response


def list_repository(registry_id, repository_name):

    cache_key = "{0}-{1}".format(registry_id, repository_name)

    json_response = mc.get(cache_key)

    if not json_response:
        app.logger.info("cache miss {0}".format(cache_key))

        paginator = client.get_paginator('describe_images')
        page_iterator = paginator.paginate(
            registryId=registry_id, repositoryName=repository_name)

        response = {'imageDetails': []}

        for page in page_iterator:
            response['imageDetails'].extend(page['imageDetails'])

        json_response = jsonify(response)

        mc.set(cache_key, json_response, image_list_cache_time)

    else:
        app.logger.info("cache hit {0}".format(cache_key))

    return json_response


if __name__ == '__main__':
    app.run(debug=True)


# If we are running under gunicorn wire up the flask and gunicorn loggers
if __name__ != '__main__':
    gunicorn_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)
