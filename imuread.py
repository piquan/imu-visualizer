#! /usr/bin/env python3

import json
import math
import numpy as np
import os
import sense_hat
import time

def main():
    hat = sense_hat.SenseHat()
    hat.set_imu_config(False, True, True)
    imu = hat._imu
    print("IMU Name: " + imu.IMUName())
    imu.setSlerpPower(0.02)
    poll_interval = imu.IMUGetPollInterval() / 1000.0
    print("Recommended poll interval", poll_interval)

    samples = 0
    next_measured_rate = time.monotonic() + 1.0
    cstr=""
    pos = np.empty(3, dtype=np.double)

    while True:
        now = time.monotonic()
        if now >= next_measured_rate:
            print(quat_string)
            print("Poll interval: ",
                  samples, now - (next_measured_rate - 1.0),
                  (now - (next_measured_rate - 1.0)) / samples)
            samples = 0
            next_measured_rate = now + 1.0

        rereads = 0
        while not imu.IMURead():
            rereads += 1
        if rereads > 5:
            print("rereads:", rereads)
        samples += 1

        # The RTIMU library here uses [w,x,y,z]
        imu_data = imu.getIMUData()
        q = imu_data['fusionQPose']
        accel = np.array(imu_data['accel'])

        p = np.sin(time.time() * 2 * math.pi / np.array([5.0, 4.0, 6.0]))

        # imu.json needs to be in [x,y,z,w]
        #quat_string = "[%f,%f,%f,%f]" % (q[1], q[2], q[3], q[0])
        # For the purposes of drawing the cube in my desired location,
        # I reorder the axes too.  On screen, we have X=right, Y=down,
        # Z=out.  In the IMU, Pin 1 is towards the side with the GPIO
        # connector and away from the side with the USB ports, but the
        # datasheet seems to be wrong (based on accelerometer
        # readings).  Hence, in a SmartPi case sitting upright, we
        # have X=right, Y=up, Z=in.  This component construction does
        # the right reorientation.
        accel *= 3
        out_data = {"o":(q[1], q[3], q[2], -q[0]),
                    "p":p.tolist(),
                    "v":(accel[0], accel[2], accel[1]),
                    "c":cstr}
        quat_string = json.dumps(out_data)
        with open("/run/user/1000/imu.json.new", "w") as fd:
            print(quat_string, file=fd)
        os.rename("/run/user/1000/imu.json.new", "/run/user/1000/imu.json")

if __name__ == "__main__":
    main()
