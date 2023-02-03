import os
import numpy as np
from api import colmap_utils

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


def prepare_data(model: str,
                 point_fields=('id', 'xyz', 'rgb', 'error'),
                 image_fields=('id', 'qvec', 'tvec', 'camera_id', 'name')):
    """ Only return the fields we need.
    """
    points = colmap_utils.read_points3d_binary(f'{model}/points3D.bin')
    images_registered = colmap_utils.read_images_binary(f'{model}/images.bin')
    points_ret = {}
    for k, v in points.items():
        points_ret[k] = dict()
        for field in point_fields:
            points_ret[k][field] = pythonfy(getattr(v, field))
    images_ret = {}
    for k, v in images_registered.items():
        images_ret[k] = dict()
        for field in image_fields:
            images_ret[k][field] = pythonfy(getattr(v, field))
    return points_ret, images_ret

@app.route("/model/<path:subpath>")
@cross_origin()
def model(subpath):
    model = escape(subpath)  # e.g 'colmap_projects/2022-12-17/P09_07-homo/'
    print(model)
    # cameras = colmap_utils.read_cameras_binary(f'{model}/cameras.bin')
    # points = colmap_utils.read_points3d_binary(f'{model}/points3D.bin')
    # images_registered = colmap_utils.read_images_binary(f'{model}/images.bin')
    points, images_registered = prepare_data(model)

    data = {
        'points': points,
        'images': images_registered,
    }

    return jsonify(data)


@app.route("/image/<path:image_path>")
@cross_origin()
def serve_image(image_path):
    image_path = '/' + escape(image_path)
    # print(image_path)
    # image_path = '/home/skynet/Zhifan/data/epic_rgb_frames/P09/P09_07/frame_0000000001.jpg'
    return send_file(image_path, mimetype='image/jpeg')


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
    root = 'colmap_projects/stables_single/P09_07-homo/'
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