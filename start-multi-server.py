#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os

# 添加backend目录到Python路径
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
sys.path.insert(0, backend_dir)

# 导入并运行主程序
from app import main

if __name__ == '__main__':
    main() 