var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var CollisionUitls = (function () {
    function CollisionUitls() {
    }
    /**
     * 返回矩形的顶点坐标位置 相对于当前父节点的坐标点。
     * @param shap
     */
    CollisionUitls.getRectangleVerPoints = function (shap) {
        var anX = shap.anchorOffsetX;
        var anY = shap.anchorOffsetY;
        var mat2x3 = shap.matrix;
        var a = mat2x3.a;
        var b = mat2x3.b;
        var c = mat2x3.c;
        var d = mat2x3.d;
        var tx = mat2x3.tx;
        var ty = mat2x3.ty;
        var w = shap.width;
        var h = shap.height;
        var p1x = -anX;
        var p1y = -anY;
        var p2x = w - anX;
        var p2y = -anY;
        var p3x = w - anX;
        var p3y = (h - anY);
        var p4x = -anX;
        var p4y = (h - anY);
        // a: 缩放或者旋转图像是影响沿x轴定位的值
        // b: 旋转或者倾斜影响y轴定位的值
        // 对x坐标有影响的值为a 和 c的值
        // 对y坐标有影响的值为b 和 d的值
        var p1 = { x: tx + a * p1x + c * p1y, y: ty + b * p1x + d * p1y };
        var p2 = { x: tx + a * p2x + c * p2y, y: ty + b * p2x + d * p2y };
        var p3 = { x: tx + a * p3x + c * p3y, y: ty + b * p3x + d * p3y };
        var p4 = { x: tx + a * p4x + c * p4y, y: ty + b * p4x + d * p4y };
        return [p1, p2, p3, p4];
    };
    /**
     * 检测圆和多边形
     * @param obj1
     * @param obj2
     */
    CollisionUitls.TestCircleAndPolygon = function (CircleX, CircleY, r, PolygonVertexPoints) {
        for (var i = 0; i < PolygonVertexPoints.length; i++) {
            var startPoint = PolygonVertexPoints[i];
            var endPoint = void 0;
            var sideNorVec = void 0;
            if (i != PolygonVertexPoints.length - 1) {
                endPoint = PolygonVertexPoints[i + 1];
            }
            else {
                //最后一个
                endPoint = PolygonVertexPoints[0];
            }
            sideNorVec = CollisionUitls.get2PointVec(startPoint, endPoint, false);
            //这个边的法相量方向（标准化过的）
            var dotNorVec = CollisionUitls.getSideNorml(sideNorVec, false);
            var data1 = CollisionUitls.calcProj(dotNorVec, PolygonVertexPoints);
            var dot = CollisionUitls.dot([CircleX, CircleY], CollisionUitls.normalize(dotNorVec));
            var value = CollisionUitls.segDist(data1.min, data1.max, dot - r, dot + r);
            if (!value) {
                return false;
            }
        }
        return true;
    };
    /**
     * 检测两个矩形是否相交
     * @param r1PointList 矩形顶点数组
     * @param r2PointList
     */
    CollisionUitls.checkPolygon = function (r1PointList, r2PointList) {
        var fun1 = function (pointlist, vertexPoints1, vertexPoints2) {
            //先计算 r1的边 ---》 顺时针
            for (var i = 0; i < pointlist.length; i++) {
                var startPoint = pointlist[i];
                var endPoint = void 0;
                var sideNorVec = void 0;
                if (i != pointlist.length - 1) {
                    endPoint = pointlist[i + 1];
                }
                else {
                    //最后一个
                    endPoint = pointlist[0];
                }
                sideNorVec = CollisionUitls.get2PointVec(startPoint, endPoint, false);
                //这个边的法相量方向（标准化过的）
                var dotNorVec = CollisionUitls.getSideNorml(sideNorVec, false);
                var data1 = CollisionUitls.calcProj(dotNorVec, vertexPoints1);
                var data2 = CollisionUitls.calcProj(dotNorVec, vertexPoints2);
                var value = CollisionUitls.segDist(data1.min, data1.max, data2.min, data2.max);
                if (!value) {
                    return false;
                }
            }
            return true;
        };
        if (!fun1(r1PointList, r1PointList, r2PointList)) {
            return false;
        }
        if (!fun1(r2PointList, r1PointList, r2PointList)) {
            return false;
        }
        return true;
    };
    /**
     * 计算某个图形坐标点到当前轴上的投影最小点
     * @param axis
     * @param objPoints
     */
    CollisionUitls.calcProj = function (axis, objPoints) {
        var min = 0;
        var max = 0;
        for (var i = 0; i < objPoints.length; i++) {
            var vec2 = [objPoints[i].x, objPoints[i].y];
            var dot = CollisionUitls.dot(vec2, CollisionUitls.normalize(axis));
            //const dot = CollisionUitls.dot(vec2,axis);
            if (min == 0 || max == 0) {
                min = max = dot;
            }
            else {
                min = (dot < min) ? dot : min;
                max = (dot > max) ? dot : max;
            }
        }
        return { min: min, max: max };
    };
    /**
     * 计算同一个轴上线段的距离s1(min1,max1),s2(min2,max2),如果距离小于0则表示两线段有相交;
     * @param min1
     * @param max1
     * @param min2
     * @param max2
     * @returns true: 相交 false: 不相交
     */
    CollisionUitls.segDist = function (min1, max1, min2, max2) {
        if (min1 < min2) {
            return min2 < max1 && max2 > min1;
        }
        else {
            return min1 < max2 && max1 > min2;
        }
    };
    /**
     * 计算两点向量方向
     * @param p1
     * @param p2
     */
    CollisionUitls.get2PointVec = function (p1, p2, isNormlize) {
        if (isNormlize === void 0) { isNormlize = true; }
        var x = p2.x - p1.x;
        var y = p2.y - p1.y;
        if (isNormlize) {
            return CollisionUitls.normalize([x, y]);
        }
        return [x, y];
    };
    /**
     * 根据当前多边形边长获取对应边长的 法线向量
     * @param vec2
     */
    CollisionUitls.getSideNorml = function (vec2, isNormlize) {
        if (isNormlize === void 0) { isNormlize = true; }
        var x = vec2[0];
        var y = vec2[1];
        //顺时针方向的法相量 
        //normal=(-y,x) || normal=(y,-x)
        if (isNormlize) {
            CollisionUitls.normalize([-y, x]);
        }
        return [-y, x];
    };
    CollisionUitls.normalize = function (vec2) {
        if (vec2.length != 2) {
            console.error("只能标准化2d向量");
            return vec2;
        }
        var x = vec2[0];
        var y = vec2[1];
        var model = Math.sqrt(x * x + y * y);
        return [x / model, y / model];
    };
    /**
     * 计算两个向量的点积
     * @param vec2A
     * @param vec2B
     */
    CollisionUitls.dot = function (vec2A, vec2B) {
        if (vec2A.length != 2 || vec2B.length != 2) {
            console.error("只能计算2d向量的点积");
            return null;
        }
        return vec2A[0] * vec2B[0] + vec2A[1] * vec2B[1];
    };
    return CollisionUitls;
}());
__reflect(CollisionUitls.prototype, "CollisionUitls");
//# sourceMappingURL=CollisionUtils.js.map