HeightController= {

    contentHeader : null,
    contentWrapper : null,
    contentFooter : null,
    slimScroll:false,
    area: null,

    onResize : function(e) {
        var self = HeightController;
        if (self.contentWrapper === null) return;
        var contentWrapperMinHeight = self.contentWrapper.style.height;
        //console.log('contentWrapperMinHeight:'+contentWrapperMinHeight);
        if (self.contentHeader === null || self.area === null || contentWrapperMinHeight === null) {
            console.log('missing area or divs with id contentHeader/contentWrapper/ or wrapper does not have height set');
            return;
        }
        var areaElement = areaElement = self.area.get(0);;
        var getYPos = function (element) {
            var y = 0;
            do {
                y += element.offsetTop;
                element = element.offsetParent;
            } while (element);
            return y;
        }

        var headHeight = getYPos(areaElement) - getYPos(self.contentHeader);
        var footerHeight = 0;
        if (self.contentFooter !== null) footerHeight = self.contentFooter.offsetHeight;
        //console.log('footerHeight:'+footerHeight);
        var contentHeight = contentWrapperMinHeight.split('p')[0];

        // the expanding element can have paging controls attached
        var pagingHeight=0;

        //console.log('footer:',self.contentFooter);
        if(self.paging!=null && self.contentFooter==null) { // we expect that if there is a footer, paging will overflow into it
            var pagingElement = self.paging.get(0);
            if(pagingElement!==undefined) {
                pagingHeight = pagingElement.offsetHeight + 10 + 4; // 10 for margin, 8 some more margin
                //console.log('pagingHeight:',pagingHeight);
            }
        }

        if(self.paging!=null && self.contentFooter!=null) { // this is more a hack - if there is both content and paging, content is shifted up using absolute positioning so that there is no blnk space
           pagingHeight+=30;
        }

        var horizontalScrollbarHeight=0;
        if(this.scrollbarParams!==undefined && (this.scrollbarParams.axis=='yx'||this.scrollbarParams.axis=='x')) {
            horizontalScrollbarHeight=10;
        }

        var maxHeight = (contentHeight - headHeight - footerHeight - pagingHeight - horizontalScrollbarHeight - 30);
        areaElement.style.maxHeight = maxHeight + 'px';

        if (self.scrollbarParams!==undefined && self.area.scrollbarCreated) {
            self.area.mCustomScrollbar("update");
            self.area.find(".mCustomScrollBox").get(0).style.maxHeight = maxHeight + 'px';
        }
        else {
            if(self.scrollbarParams!==undefined)
            {
                self.area.mCustomScrollbar(this.scrollbarParams);
                self.area.scrollbarCreated = true;
            }
        }
    },


    scrollTo:function(selector) {
        this.area.mCustomScrollbar("scrollTo",selector);
    },

    positionHistory: {},

    maintainPosition:function(id) {
        //console.log('request to maintain position:'+id);
        this.currentId=id;
        let targetPosition=this.positionHistory[id];
        //console.log('  old position:'+targetPosition);
        if(targetPosition!==undefined) this.scrollTo(targetPosition);
    },

    onAreaRendered: function(area,scrollbarParams) {
        //reset setting from previous page
        this.currentId=null;
        var self=this;
        if(scrollbarParams===undefined) {
            this.scrollbarParams={
                theme: "dark-thick",
                //createElements:false,
                autoHideScrollbar: true,
                scrollbarPosition: 'outside',
                scrollButtons: {enable: true},
                callbacks: {
                    onScroll: function() {
                        if(self.currentId!==null) HeightController.positionHistory[self.currentId]=Math.abs(this.mcs.top);
                    }
                }
            };
        } else {
            if(!scrollbarParams.scrollbarDisabled)
                this.scrollbarParams=scrollbarParams;
        }
        this.area=$(area);
        this.paging=$('.contentPagingControl');
        if((typeof this.area.get(0))==='undefined') {
            throw "Missing area to scale";
            this.area=null;
        }
        this.contentHeader = document.getElementById('content-header');
        this.contentWrapper = document.getElementById('content-wrapper');
        this.contentFooter = document.getElementById('content-footer');
        this.slimScroll=true;
        this.onResize();
    },

    onAreaDestroyed: function(area) {
        this.area=null;
    },


    setup: function() {
        // the layout onRender is called before onAreaRendered sometimes
        //if(this.contentWrapper!==null)
        {
            window.addEventListener('resize', HeightController.onResize, false);
            this.onResize();
        }
    }

};

