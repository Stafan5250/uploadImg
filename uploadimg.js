//$(this).UploadImg({
//    "maxWidth": 800,                 // 图片输出的最大宽度或高度
//    "newImgType": "",                // 图片输出类型 不传参默认png
//    "imgQuality": "",                // 图片压缩质量 不传参默认0.8 且只针对输出类型为jpeg/webp
//    "borderWidth": 10,               // 不传 默认0  如果设置宽度，输出图片宽高将加上边宽的两倍
//    "borderColor": "#00f",           // 默认白色  
//    "shapeType": "rectangle",        // 形状类型 circle square or rectangle 默认rectangle
//    "imgBackground": "",             // 背景色 jpeg 默认黑色 png 默认透明
//    uploadProgress: function(rate){
//        console.log(rate);
//    },
//    uploadFinished: function(data) {
//        console.log(data)   // data.status: -1: 参数传入出错  0: 表示成功获取图片base64 
//    },
//    uploadError: function(msg){
//        console.log(msg);
//    }
//});
(function($, window, document, undefined) {

    var UploadImgOption = function(ele, opt) {
        this.$element = ele,
            this.defaults = {
                "maxWidth": 1024,
                "newImgType": "png",
                "borderWidth": 0,
                "borderColor": "#fff",
                "imgQuality": "0.8",
                "shapeType": "rectangle",
                "imgBackground": "",
                "uploadProgress": function() {},
                "uploadFinished": function() {},
                "uploadError": function() {}
            },
            this.options = $.extend({}, this.defaults, opt);
    };

    UploadImgOption.prototype = {
        _upload: function() {

            var file = this.$element[0].files[0],
                options = this.options,
                _this = this,
                res_data,
                Orientation,
                colorArr = [],
                colorRgb = {
                    r: 255,
                    g: 255,
                    b: 255
                };
            // 判断是否添加背景色
            if (!!options.imgBackground) {
                // 判断是否rgb
                var _rgb = null;
                _rgb = /^(rgb|RGB)\(\d{1,3}\,\d{1,3}\,\d{1,3}\)$/.test(options.imgBackground) ? options.imgBackground : _this._colorRgb(options.imgBackground);
                if (_rgb != -1) {
                    var colorIsTrue = true;
                    colorArr = _rgb.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
                    for (var i = 0; i < 3; i++) {
                        if (colorArr[i] > 255 || colorArr[i] < 0) {
                            options.uploadFinished({
                                status: -1,
                                msg: "报错： 参数borderColor: " + _rgb + " 错误,请传入正确的RGB颜色"
                            });
                            colorIsTrue = false;
                            break;
                        }
                    }
                    if (colorIsTrue) {
                        colorRgb.r = colorArr[0];
                        colorRgb.g = colorArr[1];
                        colorRgb.b = colorArr[2];
                    }
                } else {
                    options.uploadFinished({
                        status: -1,
                        msg: "报错： 参数borderColor: " + options.imgBackground + " 错误，请传入正确的16进制颜色或RGB颜色"
                    });
                }
            }

            if (!!file) {

                var rFilter = /^(image\/jpeg|image\/png)$/i; // 检查图片格式  
                if (!rFilter.test(file.type)) {
                    options.uploadFinished({
                        status: -1,
                        msg: "报错： 上传图片格式只能是jpeg/png"
                    });
                    return false;
                }
                var oReader = new FileReader();
                oReader.onprogress = function(e) {
                    var rate = (e.loaded / e.total * 100).toFixed() + "%";
                    options.uploadProgress("上传进度: " + rate);
                };
                oReader.onload = function(e) {

                    var image = new Image(),
                        base64 = null;
                    image.src = e.target.result;
                    image.onload = function() {
                        var expectWidth = this.naturalWidth,
                            expectHeight = this.naturalHeight,
                            maxSide = Math.max(expectWidth, expectHeight),
                            minSide = Math.min(expectWidth, expectHeight),
                            maxW = 0,
                            maxH = 0;
                        // 同比例压缩宽高
                        if (maxSide > options.maxWidth) {
                            minSide = minSide / maxSide * options.maxWidth;
                            if (expectWidth > expectHeight) {
                                expectWidth = options.maxWidth;
                                expectHeight = minSide;
                                maxH = options.shapeType !== "rectangle" ? Number(((expectWidth - expectHeight) / 2).toFixed(2)) : 0;
                            } else {
                                expectWidth = minSide;
                                expectHeight = options.maxWidth;
                                maxW = options.shapeType !== "rectangle" ? Number(((expectHeight - expectWidth) / 2).toFixed(2)) : 0;
                            }
                        } else {
                            if (expectWidth > expectHeight) {
                                maxH = options.shapeType !== "rectangle" ? Number(((expectWidth - expectHeight) / 2).toFixed(2)) : 0;
                            } else {
                                maxW = options.shapeType !== "rectangle" ? Number(((expectHeight - expectWidth) / 2).toFixed(2)) : 0;
                            }
                        }
                        var canvas = document.createElement("canvas"),
                            canvas2 = document.createElement("canvas"),
                            ctx = canvas.getContext("2d"),
                            ctx2 = canvas2.getContext("2d");

                        // 是否输出正方形图片
                        if (options.shapeType !== "rectangle") {
                            var max = Math.max(expectWidth, expectHeight) + options.borderWidth * 2;
                            canvas.width = max;
                            canvas.height = canvas.width;
                            canvas2.width = max + options.borderWidth * 2;
                            canvas2.height = canvas2.width;
                        } else {
                            canvas.width = expectWidth + options.borderWidth * 2;
                            canvas.height = expectHeight + options.borderWidth * 2;
                        }

                        // 将canvas的透明背景设置成白色 设置边框  
                        if (options.shapeType !== "rectangle") {

                            // 将图片转换为正方形 并设置空白区域颜色
                            if (options.shapeType === "square" && !!options.imgBackground) {
                                _this._drawImgBackground(ctx, canvas.width, canvas.height, colorRgb);
                            }

                            // 将图片转换为圆角
                            if (options.shapeType === "circle") {
                                ctx2.drawImage(this, options.borderWidth + maxW, options.borderWidth + maxH, expectWidth, expectHeight);
                                _this._drawImgBackground(ctx2, canvas2.width, canvas2.height, colorRgb);
                                var cli = {
                                    x: canvas.width / 2,
                                    y: canvas.height / 2,
                                    r: canvas.width / 2,
                                    r2: canvas.width / 2 - options.borderWidth
                                };
                                // 画上边框
                                if (!!options.borderWidth) {
                                    ctx.fillStyle = options.borderColor;
                                    ctx.beginPath();
                                    ctx.arc(cli.x, cli.y, cli.r, 0, Math.PI * 2, false);
                                    ctx.fill();
                                }

                                // // 添加背景色
                                if (!!options.imgBackground) {
                                    _this._drawImgBackground(ctx, canvas.width, canvas.height, colorRgb);
                                }
                                // 画上图片
                                var m_pattern = ctx.createPattern(canvas2, "no-repeat");
                                ctx.beginPath();
                                ctx.fillStyle = m_pattern;
                                ctx.arc(cli.x, cli.y, cli.r2, 0, Math.PI * 2, false);
                                ctx.fill();
                            }
                        }

                        if (options.shapeType !== "circle") {
                            ctx.drawImage(this, options.borderWidth + maxW, options.borderWidth + maxH, expectWidth, expectHeight);
                        }

                        // 是否有 border 画上边框
                        if (!!options.borderWidth && options.shapeType !== "circle") {
                            _this._drawImgBorder(ctx, options.borderWidth, options.borderColor, canvas.width, canvas.height);
                        }

                        // 输出base64
                        base64 = _this._outputImgType(options.newImgType, canvas, options.imgQuality);

                        options.uploadFinished({
                            status: 0,
                            msg: "上传图片成功",
                            base64: base64
                        });
                    };
                };
                oReader.onerror = function(e) {
                    options.uploadError("报错： 上传图片出错");
                };
                oReader.readAsDataURL(file);
            }
        },
        // 16进制颜色转换成 RGB
        _colorRgb: function(hex) {
            var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/,
                sColor = hex.toLowerCase();
            if (sColor && reg.test(sColor)) {
                if (sColor.length === 4) {
                    var sColorNew = "#";
                    for (var i = 1; i < 4; i += 1) {
                        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
                    }
                    sColor = sColorNew;
                }
                //处理六位的颜色值
                var sColorChange = [];
                for (var j = 1; j < 7; j += 2) {
                    sColorChange.push(parseInt("0x" + sColor.slice(j, j + 2)));
                }
                return "RGB(" + sColorChange.join(",") + ")";
            } else {
                return -1;
            }
        },
        // 输出图片类型 png/jpeg
        _outputImgType: function(type, canvas, quality) {
            var data = null;
            if (type == "png") {
                data = canvas.toDataURL("image/" + quality);
            } else {
                data = canvas.toDataURL("image/" + type, quality);
            }
            console.log("输出图片类型为" + type);
            return data;
        },
        // 背景颜色
        _drawImgBackground: function(ctx, width, height, colorRgb) {
            var imageData = ctx.getImageData(0, 0, width, height);
            for (var i = 0; i < imageData.data.length; i += 4) {
                // 当该像素是透明的，则设置成白色   
                if (imageData.data[i + 3] === 0) {
                    imageData.data[i] = colorRgb.r;
                    imageData.data[i + 1] = colorRgb.g;
                    imageData.data[i + 2] = colorRgb.b;
                    imageData.data[i + 3] = 255;
                }
            }
            ctx.putImageData(imageData, 0, 0);
        },
        // 边框颜色
        _drawImgBorder: function(ctx, borderWidth, borderColor, canvasWidth, canvasHeight) {
            var w = borderWidth;
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = w;
            ctx.moveTo(w / 2, w / 2);
            ctx.lineTo(canvasWidth - w / 2, w / 2);
            ctx.lineTo(canvasWidth - w / 2, canvasHeight - w / 2);
            ctx.lineTo(w / 2, canvasHeight - w / 2);
            ctx.closePath();
            ctx.stroke();
        }
    };

    $.fn.UploadImg = function(options) {
        if (!window.FileReader) {
            alert("您的浏览器不支持 HTML5 的 FileReader API， 因此无法初始化图片裁剪插件，请更换最新的浏览器！");
            return;
        }
        var uploadImg = new UploadImgOption(this, options);
        return this.on("change", function() {
            uploadImg._upload();
        });
    };

})(jQuery, window, document);
