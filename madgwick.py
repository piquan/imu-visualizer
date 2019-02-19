#! /usr/bin/env python3

import ctypes

# Get the C source from http://www.x-io.co.uk/res/sw/madgwick_algorithm_c.zip
# Compile with:
#     gcc -O2 -shared -o libmadgwick.so -fPIC MadgwickAHRS.c

#extern volatile float beta;
#extern volatile float q0, q1, q2, q3;
#void MadgwickAHRSupdate(float gx, float gy, float gz, float ax, float ay, float az, float mx, float my, float mz);
#void MadgwickAHRSupdateIMU(float gx, float gy, float gz, float ax, float ay, float az);

_madgwick = ctypes.CDLL("./libmadgwick.so")

c_beta = ctypes.c_float.in_dll(_madgwick, "beta")

def beta(value=None):
    if value is not None:
        c_beta.value = value
    return c_beta.value

c_q = (ctypes.c_float.in_dll(_madgwick, "q0"),
       ctypes.c_float.in_dll(_madgwick, "q1"),
       ctypes.c_float.in_dll(_madgwick, "q2"),
       ctypes.c_float.in_dll(_madgwick, "q3"))

def q(values=None):
    if values is not None:
        (c_q[0].value, c_q[1].value, c_q[2].value, c_q[3].value) = values
    return (c_q[0].value, c_q[1].value, c_q[2].value, c_q[3].value)

AHRSupdate = _madgwick.MadgwickAHRSupdate
AHRSupdate.argtypes = [ctypes.c_float] * 9
AHRSupdate.restype = None

AHRSupdateIMU = _madgwick.MadgwickAHRSupdateIMU
AHRSupdateIMU.argtypes = [ctypes.c_float] * 6
AHRSupdateIMU.restype = None
