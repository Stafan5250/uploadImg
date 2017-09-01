// $(this).UploadImg({
//     "maxWidth": 800,                 // 图片输出的最大宽度或高度 有边框时最大宽度/高度会加上borderWidth*2
//     "newImgType": "png",             // 图片输出类型 不传参默认png
//     "imgQuality": "0.8",             // 图片压缩质量 不传参默认0.8 且只针对输出类型为jpeg/webp
//     "borderWidth": 10,               // 不传 默认0
//     "borderColor": "#00f",           // 默认白色  
//     uploadProgress: function(rate){  // 加载图片进度 百分比
//         console.log(rate);
//     },
//     uploadFinished: function(data) {
//         console.log(data);           // data.status: -1: 参数传入出错  0: 表示成功获取图片base64,data.base64         
//     },
//     uploadError: function(msg){      // 加载出错
//         console.log(msg);
//     }
// });
;
(function($, window, document, undefined) {

    var UploadImgOption = function(ele, opt) {
        this.$element = ele,
            this.defaults = {
                "maxWidth": 1024,
                "newImgType": "png",
                "borderWidth": 0,
                "borderColor": "#fff",
                "imgQuality": "0.8",
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
            // 将borderColor转换成rgb
            if (_this._colorRgb(options.borderColor) != -1) {
                colorArr = _this._colorRgb(options.borderColor).replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
                colorRgb.r = colorArr[0];
                colorRgb.g = colorArr[1];
                colorRgb.b = colorArr[2];
            } else {
                res_data = {
                    status: -1,
                    msg: "传入参数borderColor出错"
                };
                options.uploadFinished(res_data);
            }


            if (!!file) {

                var rFilter = /^(image\/jpeg|image\/png)$/i; // 检查图片格式  
                if (!rFilter.test(file.type)) {
                    res_data = {
                        status: -1,
                        msg: "上传图片格式只能是jpeg/png"
                    };
                    options.uploadFinished(res_data);
                    return false;
                }

                var oReader = new FileReader();

                oReader.onprogress = function(e) {
                    var rate = (e.loaded / e.total * 100).toFixed() + "%";
                    options.uploadProgress(rate);
                };

                oReader.onload = function(e) {

                    var image = new Image(),
                        base64 = null;
                    image.src = e.target.result;

                    image.onload = function() {

                        var expectWidth = this.naturalWidth,
                            expectHeight = this.naturalHeight,
                            maxSide = Math.max(expectWidth, expectHeight);

                        if (maxSide > options.maxWidth) {
                            var minSide = Math.min(expectWidth, expectHeight);
                            minSide = minSide / maxSide * options.maxWidth;
                            maxSide = options.maxWidth;
                            if (expectWidth > expectHeight) {
                                expectWidth = maxSide;
                                expectHeight = minSide;
                            } else {
                                expectWidth = minSide;
                                expectHeight = maxSide;
                            }
                        }
                        var canvas = document.createElement("canvas");
                        var ctx = canvas.getContext("2d");

                        canvas.width = expectWidth + options.borderWidth * 2;
                        canvas.height = expectHeight + options.borderWidth * 2;

                        // 将canvas的透明背景设置成白色 设置边框  
                        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
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

                        ctx.drawImage(this, options.borderWidth, options.borderWidth, expectWidth, expectHeight);

                        if (options.newImgType == "png") {
                            base64 = canvas.toDataURL("image/" + options.newImgType);
                        } else {
                            base64 = canvas.toDataURL("image/" + options.newImgType, options.imgQuality);
                        }

                        res_data = {
                            status: 0,
                            msg: "成功",
                            base64: base64
                        };
                        options.uploadFinished(res_data);
                    };
                };
                oReader.onerror = function(e) {
                    options.uploadError("上传图片出错");
                };
                oReader.readAsDataURL(file);
            }
        },
        _colorRgb: function(hex) { /*16进制颜色转为RGB格式*/
            //十六进制颜色值的正则表达式
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
        }
    };

    $.fn.UploadImg = function(options) {

        if (!window.FileReader) {
            alert("您的浏览器不支持 HTML5 的 FileReader API， 因此无法初始化图片裁剪插件，请更换最新的浏览器！");
            return;
        }

        var uploadImg = new UploadImgOption(this, options);
        return uploadImg._upload();
    };

})(jQuery, window, document);
