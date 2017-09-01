// 图片转化成base64
// 可通过配置参数输出 操作后的图片 base64
// 图片类型 大小 背景 边框 图片形状及边框、背景颜色设置
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
