import os
import numpy as np
import ujson

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


def generate_colormap(num_colors):
    from matplotlib import pyplot as plt
    colormap = plt.get_cmap("hsv", num_colors)
    color_dict = {}
    inds = np.arange(num_colors)
    np.random.seed(42)
    inds = np.random.permutation(inds)
    for i in range(num_colors):
        color_name = f"color_{i}"
        color_dict[color_name] = colormap(inds[i])[:3]
    return color_dict


@app.route("/model/<path:subpath>")
@cross_origin()
def model(subpath):
    model = escape(subpath)  # e.g 'colmap_projects/json_models/P04_01_skeletons.json'
    print(model)
    with open(model) as fp:
        data = ujson.load(fp)

    return jsonify(data)


@app.route("/registration/<path:reg_path>")
@cross_origin()
def registration(reg_path):
    """ We merge everything together in the server side:
    - Loading of different models 
    - Rotate, scale and translate 
    - Color the points
    - Loading the line, color it

    Returns: {
        'points': [ [x, y, z, r, g, b], ... ],
        'lines': [ [x1 y1 z1 x2 y2 z2 r g b], ...]
        NotImplemented: 'images': [], 'line': []
    }
    """
    reg = escape(reg_path)  # e.g 'colmap_projects/registration/P04A/P04A.json'
    print(reg)
    with open(reg) as fp:
        model_infos = ujson.load(fp)
    
    colors = generate_colormap(32)
    alpha = 0.5
    model_prefix = 'colmap_projects/json_models/'
    model_suffix = '_skeletons.json'

    all_points = []
    all_lines = []
    for model_info, clr in zip(model_infos, colors.values()):
        model_path = model_prefix + model_info['model_vid'] + model_suffix
        with open(model_path) as fp:
            model = ujson.load(fp)
            points = np.asarray(model['points'])
            images = np.asarray(model['images'])
            if 'line' in model:
                line = np.asarray(model['line']).reshape(-1, 3)
            else:
                line = np.float32([0, 0, 0, 1, 0, 0]).reshape(-1, 3)

        rot = np.asarray(model_info['rot']).reshape(3, 3)
        transl = np.asarray(model_info['transl'])
        scale = model_info['scale']

        pos = points[:, :3] * scale @ rot.T + transl
        rgb = alpha * points[:, 3:] / 255 + (1-alpha) * np.float32(clr)
        rgb = np.uint8(np.clip(rgb, 0, 1) * 255)
        new_points = np.concatenate([pos, rgb], axis=1)
        all_points.extend(new_points.tolist())

        # qtvecs = np.asarray(model['images'])
        # w2c = None
        # inv_transf = None # of r,s,t
        # new_w2c = w2c @ inv_transf
        # qtvecs = None # Extract qtvecs from w2c

        line_length = 10
        line = line * scale @ rot.T + transl
        vc = (line[0, :] + line[1, :]) / 2
        line_dir = line[1, :] - line[0, :]
        line_len_half = line_length / 2
        lst = vc + line_len_half * line_dir
        led = vc - line_len_half * line_dir
        cur_line = np.concatenate([lst, led, 255 * np.float32(clr)]).tolist()
        all_lines.append(cur_line)

    data = {
        'points': all_points,
        'lines': all_lines,
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
    json_model = 'colmap_projects/json_models/P04_01_skeletons.json'
    with open(json_model) as fp:
        json_data = ujson.load(fp)