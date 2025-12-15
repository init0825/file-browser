#!/bin/bash

# 下载各种格式测试文件的脚本

echo "正在下载测试文件..."

# 创建目录
mkdir -p test-files/images
mkdir -p test-files/media
mkdir -p test-files/documents

# 下载图片文件
echo "下载图片文件..."
# PNG
curl -L -o test-files/images/sample.png "https://sample-files.com/downloads/images/png/sample/640x426/sample_640x426.png"
# GIF
curl -L -o test-files/images/sample.gif "https://sample-files.com/downloads/images/gif/sample/640x426/sample_640x426.gif"
# SVG
curl -L -o test-files/images/car.svg "https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/car.svg"
# JPG
curl -L -o test-files/images/landscape.jpg "https://www.w3schools.com/css/img_5terre. jpg"

# 下载视频文件
echo "下载视频文件..."
# MP4
curl -L -o test-files/media/oceans. mp4 "http://vjs.zencdn.net/v/oceans.mp4"
# 另一个MP4
curl -L -o test-files/media/bunny.mp4 "https://www.w3schools.com/html/mov_bbb.mp4"

# 下载音频文件
echo "下载音频文件..."
# MP3
curl -L -o test-files/media/horse.mp3 "https://www.w3schools.com/html/horse.mp3"

# 下载文档文件
echo "下载文档文件..."
# PDF
curl -L -o test-files/documents/sample.pdf "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"

echo ""
echo "下载完成！文件列表："
find test-files -type f \( -name "*.png" -o -name "*.gif" -o -name "*.svg" -o -name "*.jpg" -o -name "*.mp4" -o -name "*.mp3" -o -name "*.pdf" \)