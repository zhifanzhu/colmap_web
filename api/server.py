from flask import Flask
from flask import request, jsonify
from flask_cors import CORS, cross_origin
from markupsafe import escape
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app = Flask(__name__)

import os
import numpy as np
from api import colmap_utils
def pythonfy(data):
    if isinstance(data, list):
        return [pythonfy(x) for x in data]
    elif isinstance(data, dict):
        return {k: pythonfy(v) for k, v in data.items()}
    elif isinstance(data, np.ndarray):
        return data.tolist()
    elif hasattr(data, '_asdict'):
        return pythonfy(data._asdict())
    return data

@app.route("/model/<path:subpath>")
@cross_origin()
def model(subpath):
    root = escape(subpath)  # e.g 'colmap_projects/2022-12-17/P09_07-homo/'
    print(root)
    model = os.path.join(root, 'sparse/0')
    # cameras = colmap_utils.read_cameras_binary(f'{model}/cameras.bin')
    points = colmap_utils.read_points3d_binary(f'{model}/points3D.bin')
    images_registered = colmap_utils.read_images_binary(f'{model}/images.bin')

    data = {
        # 'camera': pythonfy(cameras),
        'points': pythonfy(points),
        'images': pythonfy(images_registered),
    }

    return jsonify(data)

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
    root = 'colmap_projects/2022-12-17/P09_07-homo/'
    model = os.path.join(root, 'sparse/0')
    cameras = colmap_utils.read_cameras_binary(f'{model}/cameras.bin')
    points = colmap_utils.read_points3d_binary(f'{model}/points3D.bin')
    images_registered = colmap_utils.read_images_binary(f'{model}/images.bin')

    data = {
        'camera': pythonfy(cameras),
        'points': pythonfy(points),
        'images': pythonfy(images_registered),
    }

    a = jsonify(data)