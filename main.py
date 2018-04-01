#!/usr/bin/env python

import boto3
from flask import Flask, jsonify, send_from_directory
import logging

app = Flask(__name__, static_url_path='/')

client = boto3.client('ecr')


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

    paginator = client.get_paginator('describe_repositories')
    page_iterator = paginator.paginate(registryId=registry_id)

    response = {'repositories': []}

    for page in page_iterator:
        response['repositories'].extend(page['repositories'])


    return jsonify(response)


def list_repository(registry_id, repository_name):

    paginator = client.get_paginator('describe_images')
    page_iterator = paginator.paginate(
        registryId=registry_id, repositoryName=repository_name)

    response = {'imageDetails': []}

    for page in page_iterator:
        response['imageDetails'].extend(page['imageDetails'])

    return jsonify(response)


if __name__ == '__main__':
    app.run(debug=True)


# If we are running under gunicorn wire up the flask and gunicorn loggers
if __name__ != '__main__':
    gunicorn_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)
