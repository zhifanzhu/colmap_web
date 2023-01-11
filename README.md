# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

https://codesandbox.io/s/hopeful-chatelet-lt473?file=/src/App.js:289-1446
https://onion2k.github.io/r3f-by-example/examples/other/instanced-points/

https://www.thefrontdev.co.uk/how-to-create-gpu-particles-in-react-three-fiber-(r3f)

# Trajectory

Frustums are sorted acoording to _func(name)_.
A *Trajectory* Object is a N-length line segments.
```
traj = Trajectory(past_length=N1, future_length=N2)
traj.set_cur(camera_sorted_index=i) // show N=N1+n2 length line-segments 
traj.autoplay(fps = FPS)  // advance cur along future by FPS
```

# Basic interface

- Points: Activate points from current camera, e.g. Reg/Green
- Display current image and corresponding points
- Click on camera: 
    - [ ] highlight on MouseHover
    - [ ] show linkage to other cameras (double click)
    - [ ] display stats (name, num_points3D, num_points3D, quat, transl)
    - (Opt) show linkage to points?
    - [ ] display trajectory (single click)

- Click on points:
    - [ ] show linkage to cameras
    - [ ] display stats (pos, color, error)

- Control panel:
    - Adjust point (size, color)
    - Filter points
    - *Select frame range*, convert frame to seconds?


# TODO

## Back-end

- [x] Read database & sparse
We don't need anything from database.db, all will be read from sparse/0
db.images might be useful, but database.db file is 10x huger (100M~1.1G)


# R3F ref
- https://github.com/pmndrs/react-three-fiber/discussions/1019
- https://docs.pmnd.rs/react-three-fiber/api/objects#attach