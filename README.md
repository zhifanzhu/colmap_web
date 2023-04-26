# Format 
This expected the json format colmap model, which should be converted from extract_primitives.py
{
    'cameras': [xxx],
    'images': [
        [qw, qx, qy, qz, tx, ty, tz]  # w2c
    ],
    'points': [
        [x, y, z, r, g, b]  # rgb in 0-255
    ]
}

# Usage

## Server
```bash
FLASK_APP=api/server.py FLASK_ENV=development python3 -m flask run --host 0.0.0.0 --port 5001
```

Test the server: `wget -qO- localhost:5001/data`.
`wget -qO- localhost:5001/model/colmap_projects/json_models/P04_01_skeletons.json`

## Client
```bash
PORT=5000 npm start
```

## Data Structure

### Registration

1. Go to <hostname>:5000/registration
2. Type colmap_projects/registration/P04A/P04A.json

### Line Drawing

TODO



# R3F ref
- https://github.com/pmndrs/react-three-fiber/discussions/1019
- https://docs.pmnd.rs/react-three-fiber/api/objects#attach