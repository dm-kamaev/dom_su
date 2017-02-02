'use strict';

async function scrollModel(model, opts) {
    let modelList;
    let begin = false;
    let end = false;
    const options = opts || {};
    const {limit=20, order='id', sort=-1, direction=-1, keyName='id', keyValue, keyItemInclude=false } = options;

    let getOrdering = function (sort){
        if (sort === 1) {
            return 'DESC'
        } if (sort === -1){
            return 'ASC'
        } else {
            throw new Error('argument sort error')
        }
    };

    function getOperator(keyItemInclude, sort, direction) {
        let operator;
        if (sort*direction === 1){
            operator = '$lt'
        }
        if (sort*direction === -1) {
            operator = '$gt'
        }

        if (keyItemInclude){
            operator += 'e'
        }
        return operator
    }

    let WHERE = {};
    let upWHERE = {};
    let downWHERE = {};



    if (keyValue){
        if (direction == 1){
            WHERE[keyName] = {}
            WHERE[keyName][getOperator(keyItemInclude, sort, direction)] = keyValue
            modelList = await model.findAll({ where: WHERE, limit: limit, order: [[order, getOrdering(sort)]]});
            if (modelList.length < limit){
                begin = true;
            }
            modelList.reverse()
        }
        if (direction == -1){
            WHERE[keyName] = {}
            WHERE[keyName][getOperator(keyItemInclude, sort, direction)] = keyValue
            modelList = await model.findAll({ where: WHERE, limit: limit, order: [[order, getOrdering(sort*direction)]]})
            if (modelList.length < limit){
                end = true;
            }}

        if (direction == 0){
            downWHERE[keyName] = {}
            downWHERE[keyName][getOperator(false, sort, -1)] = keyValue;
            upWHERE[keyName] = {};
            upWHERE[keyName][getOperator(true, sort, 1)] = keyValue;
            const [upModelList, downModelList] = await Promise.all([
                model.findAll({where: upWHERE, limit: limit, order: [[order, getOrdering(sort)]]}),
                model.findAll({where: downWHERE, limit: limit, order: [[order, getOrdering(sort*-1)]]}),
            ]);
            let halfLong = (limit % 2 == 1) ? (limit+1)/2 : limit/2;
            if (upModelList.length <= halfLong){
                begin = true;
            }
            if (downModelList.length < halfLong){
                end = true;
            }
            let tempModelList = upModelList.reverse().concat(downModelList);
            if (tempModelList.length < limit){
                modelList = tempModelList
            } else {
                let spliceIndex;
                if (begin){
                    spliceIndex = 0;
                } else {
                    if (end){
                        spliceIndex = -limit;
                    } else {
                        spliceIndex = upModelList.length - halfLong;
                    }
                }
                modelList = tempModelList.splice(spliceIndex, limit)
            }
        }
    } else {
        modelList = await model.findAll({ limit: limit, order: [[order, getOrdering(sort)]]})
        begin = true;
        if (modelList.length < limit){
            end = true;
        }
    }
    return {modelList: modelList, begin: begin, end: end}
}


module.exports = {scrollModel: scrollModel}