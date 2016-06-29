/**
 * Created by 殿麒 on 2016/6/29.
 */


describe("Test HB obj's method",function(){

    describe("Test HB.obj",function(){

        var obj1 = {
            prop1:1,
            prop2:2,
            prop3:3
        }
        var obj2 = {
            prop1:1,
            prop3:3
        }

        it("如果【参数1中的属性】在【参数2中都有】且【属性的值也相等】 则返回true 否则返回false",function(){

            expect(HB.obj.toEquals(obj1,obj2)).toBe(true);
            expect(HB.obj.toEquals(obj2,obj1)).toBe(false);

        });

        it('为一个对象增加属性 第三个参数 表示新增属性是否会覆盖原对象的属性 true表示 会覆盖',function(){

            expect(HB.obj.addProp(obj1,{prop1:2,someProp:1,otherProp:2},true)).toEqual({prop1:2,
                prop2:2,
                prop3:3,
                someProp:1,
                otherProp:2
            });

            //  注意经过第一个测试用力后obj1的值已经被改为22312
            expect(HB.obj.addProp(obj1,{prop1:1,otherProp:2},false)).toEqual({prop1:2,
                prop2:2,
                prop3:3,
                someProp:1,
                otherProp:2
            });

        });

        it("如果该对象为空 则返回true 否则返回false",function(){

            expect(HB.obj.isEmpty(obj1)).toBe(false);
            expect(HB.obj.isEmpty({})).toBe(true);

        });


    });




    describe("Test HB.arrObj",function(){

        var testArr = [{prop1:1,prop2:2,prop:3},{prop1:1,prop2:2,prop:2},{prop:2,prop1:2}];
        var condition = {prop1:1,prop2:2};

        it("从指定数组中找到所有符合条件的对象 返回 该数组中 所有符合条件的对象的新集合",function(){

            expect(HB.arrObj.findObjs(testArr,condition)).toEqual([{prop1:1,prop2:2,prop:3},{prop1:1,prop2:2,prop:2}])

        });

        it("从指定数组中找到所有符合条件的对象 返回 该数组中 所有符合条件的对象的索引下标新集合",function(){

            expect(HB.arrObj.findIndex(testArr,condition)).toEqual([0,1]);

        });

        it("从数组中删掉符合条件的对象",function(){

            expect(HB.arrObj.deleteObjs(testArr,condition)).toEqual([{prop:2,prop1:2}]);

        });

    });

});