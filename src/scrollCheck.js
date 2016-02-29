(function ($) {

    var _scrollCheck = null;

    function posInPos(arr1,arr2){
        if(arr1[0]>arr2[0]&&arr1[1]<arr2[1]){
            return true
        }
        return false;
    }

    function ScrollCheck() {
        this.listenDomArr = [];
        this.init();
    }

    ScrollCheck.prototype={
        constructor:ScrollCheck,
        init:function(){
            this.binEvent();
        },
        addDom:function(dom,options){
            var _dom = dom;
            var object = {
                dom : _dom,
                top:_dom.offset().top,
                height:_dom.height(),
                topOffset:options['topOffset']||0,
                bottomOffset:options['bottomOffset']||0
            };
            var listenDomArr = this.listenDomArr;
            for(var i=0,len=listenDomArr.length;i<len;i++){
                if(listenDomArr[i].dom.get(0) == dom.get(0)){
                    console.error('dom["'+dom.get(0).className+'"] has bind scroll check');
                    return false;
                }
            }

            this.listenDomArr.push(object);
            for(var key in options){
                if(typeof options[key] == 'function'){
                    (function(mkey){
                        if(mkey == 'one'){
                            _dom.one('ScrollCheck:enter',function(){
                                options[mkey].call(_dom);
                            });
                        }else{
                            _dom.bind('ScrollCheck:'+mkey,function(){
                                options[mkey].call(_dom);
                            });
                        }
                    })(key);
                }
            }
            this.executeScore();
        },
        binEvent:function(){
            var _this = this;
            $(document).bind('scroll',function(){
                _this.executeScore();
            })
        },
        executeScore:function(){
            var listenDomArr = this.listenDomArr,
                scrollTop = $('body').scrollTop(),
                visHeight = $(window).height(),
                documentPos = [scrollTop,scrollTop+visHeight];
            this.resizeOffset();
            for(var i= 0,len=listenDomArr.length;i<len;i++){
                var domObj = listenDomArr[i];
                if(domObj.top ==0 && domObj.height == 0 ){
                    return;
                }
                var domPos = [domObj.top+domObj.topOffset,domObj.top+domObj.height+domObj.bottomOffset];
                var check = posInPos(domPos,documentPos);
                if(check){
                    if(!domObj.isVisible){
                        domObj.isVisible = true;
                        domObj.dom.trigger('ScrollCheck:enter');
                    }
                }else{
                    if(domObj.isVisible){
                        domObj.isVisible = false;
                        domObj.dom.trigger('ScrollCheck:leave');
                    }
                }
            }

        },
        resizeOffset:function(){
            var listenDomArr = this.listenDomArr;
            for(var i= 0,len=listenDomArr.length;i<len;i++){
                var domObj = listenDomArr[i];
                var dom = domObj.dom;
                listenDomArr[i].top = dom.offset().top;
                listenDomArr[i].height = dom.height();
            }
        }
    };


    /**
     * 这里是将Plugin对象 转为jq插件的形式进行调用
     * 定义一个插件 plugin
     */
    $.fn.scrollCheck = function(options){
        return this.each(function () {
            var $this = $(this);
            if(!_scrollCheck){
                _scrollCheck =  new ScrollCheck();
            }
            if(typeof options == 'object'){
                _scrollCheck.addDom($this,options);
            }else{
                if(options == 'resizeOffset'){
                    _scrollCheck.resizeOffset();
                }
            }
        })
    };

})($);