#EasyValidator
#一个简单的js表单验证插件
##插件说明
* 初期表单验证只支持预绑定字段验证，对于动态创建的字段验证尚不支持
* 支持自定义验证函数，ajax同步校验
* 文本输入框和select表单元素验证支持，对于radio，checkbox验证不支持，实际上，也不需要支持radio
* UI效果类似支付宝注册
##效果截图
![demo 截图](https://github.com/xiaomingming/EasyValidator/blob/master/images/demo.jpg)
##语法说明

###初始化

```
checkObj.initialize($('#login'),{fullName:$('.user-name')},{
    fullName:{
        isRequired:true,//必须验证字段
        tips:'用户名就是你的昵称啊',//验证提示
        defaultValidate:['userName']//使用默认的常用验证 userName验证
    }
});
```
###参数说明

初始化验证时，需要给checkObj对象的initialize方法传入参数：分别为：

* 欲验证的表单form jquery对象
* 验证的字段对象
* 验证字段对相应的验证规则
* 可选字段，回调函数

这三个是必须设置的参数。若想在表单验证完成后，不使用默认的表单提交，而需要回调函数进一步做控制，则第四个参数可以传入回调，自行控制。
传入回调后，请手动设置表单提交，更改Action。

一个有回调的验证示例：

```
checkObj.initialize($('#login'),{fullName:$('.user-name')},{
    fullName:{
        tips:'用户名就是你的昵称啊',
        defaultValidate:['userName']
    }
},function(){
    // form callback is here
    alert('validator is perfect!');
});
```
###验证规则设置

验证字段名称应当和验证规则名称对应起来：比如示例中的 **fullName** 字段和规则中的 **fullName**

验证规则对象中，**isRequired**属性代表的是该字段是否为必须验证字段，**tips**属性代表的是验证提示，也就是鼠标focus到输入框时的提示文字，若不需要提示，请不要写上该属性

**defaultValidate** 属性可以设置单个验证，也可以设置多个验证。单个验证可以用字符串指明，比如：'userNameValidateRule'。多个验证组合，请放在数组中，比如['isEmpty','isNumber']。但是这里不建议这么做。如果有一些常用的验证规则，请直接写入该插件中，在checkObj.checkFunc命名空间进行验证扩展。比如：

```
// 用户名验证
checkObj.checkFunc.userName = {
    validate: function(val) {
        if ($.trim(val) === '') {
            this.message = '用户名不能为空';
            return false;
        }
        if (/\w/g.test(val) === false) {
            this.message = '用户名输入只能为数字，字母和下划线';
            return false;
        }
        if ($.trim(val).length > 16 || $.trim(val).length < 2) {
            this.message = '用户名长度错误';
            return false;
        }
        return true;
    },
    message: ''
};
/*
 * 检查是否为空
 */
checkObj.checkFunc.isEmpty = {
    validate: function(val) {
        return $.trim(val) !== '';
    },
    message: '输入不能为空！' //错误消息
}
```

验证规则的**validate**函数必须返回布尔值，**val**代表验证字段的输入值。**message**属性则是错误信息提示。

###自定义验证规则

如何自定义验证规则呢？这个验证插件，实际上，我只是提供了验证的语法，考虑到实际的验证规则因项目而异，我就没有内置验证规则。
因此这里大家可以自由定义咯。嘻嘻。那么如何定义呢？

验证规则的定义分为两种：
* 对于通用的验证规则，可以像userName那样，写在验证插件中，然后就可以在验证规则中进行调用了。这个时候，使用defaultvalidate属性进行调用。
* 对于私有的验证规则，也就是很少用到的验证字段，可以直接在验证规则中定义，而不用写在插件中。比如密码校验：

```
pwd:{
    isRequired:true,
    tips:'先填写我哦',
    defaultValidate:['isEmpty'],
    minLength:{
        validate:function(val){
            return val.length>=6;
        },
        message:'密码长度至少6位以上'
    },
    isSame:{
        validate:function(val){
            if($('.confirm-pwd').val()!==''){
                return val===$('.confirm-pwd').val();
            }else {
                return true;
            }
        },
        message:'密码不一致'
    }
}
```
以上规则中，使用了通用的验证规则 *defaultValidate:['isEmpty']*，而且还自定义了私有的验证规则，*minLength* 和*isSame*。

###Ajax同步校验

通常会有这样的校验需求，我们需要验证登陆用户名是不是正确的，这时就需要和后端进行通信验证了。异步校验，无法同步返回验证结果。
所以只能设置为同步校验了，可以设置 jquery 内置方法ajax async属性为 false。

示例：

```
fullName:{
    isRequired:true,
    tips:'用户名就是你的昵称啊',
    defaultValidate:['isUserName']
```


