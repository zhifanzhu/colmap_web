import os
import numpy as np
import json

from flask import (
    Flask,
    request, jsonify, send_file
)
from flask_cors import CORS, cross_origin
from markupsafe import escape

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app = Flask(__name__)


@app.route("/model/<path:subpath>")
@cross_origin()
def model(subpath):
    model = escape(subpath)  # e.g 'colmap_projects/json_models/P04_01_skeletons.json'
    print(model)
    with open(model) as fp:
        data = json.load(fp)

    return jsonify(data)


# @app.route("/image/<path:image_path>")
# @cross_origin()
# def serve_image(image_path):
#     image_path = '/' + escape(image_path)
#     # print(image_path)
#     # image_path = '/home/skynet/Zhifan/data/epic_rgb_frames/P09/P09_07/frame_0000000001.jpg'
#     return send_file(image_path, mimetype='image/jpeg')


@app.route("/data")
@cross_origin()
def data():
    data = [
        {
            'example-data': 'example-number',
        }
    ]
    return jsonify(data)


if __name__ == '__main__':
    json_model = 'colmap_projects/json_models/P04_01_skeletons.json'
    with open(json_model) as fp:
        json_data = json.load(fp)