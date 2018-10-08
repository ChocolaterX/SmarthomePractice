#!/usr/bin/env python
# -*- coding:utf-8 -*-

import sys
import wave
import os
import traceback

__author__ = "Jiang Yaohua"

errstr = ''

def convToPcm(src, dest):
    fs = open(src, 'r')
    srcStr = b''
    line = fs.readline()
    fs.close()
    srcStr = bytes.fromhex(line)
    line = None
    fd = wave.open(dest, "wb")
    fd.setnchannels(1)
    fd.setsampwidth(2)
    fd.setframerate(8000)		#16000  2018.3.14 edited by jsy
    # fd.setparams((1, 2, 16000, -1, 'NONE', 'not compressed'))
    fd.writeframesraw(srcStr)
    fd.close()


if len(sys.argv) == 1:
    srcfile = './voice.txt'
    destfile = './voice.wav'
else:
    srcfile = sys.argv[1]
    pathname = os.path.splitext(srcfile)[0]
    destfile = pathname + '.wav'
try:
    convToPcm(srcfile, destfile)
    sys.exit(1)
except:
    info = sys.exc_info()
    print(info[0], ":", info[1])
    sys.exit(0)
