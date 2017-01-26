'use strict';

const {AdminPanelError, ErrorCodes} = require('./errors')


class AdminModel {
    constructor(Model){
        if (Model === undefined)
            throw new AdminPanelError(ErrorCodes.ModelIsEmpty)

        this.name = Model.name
        this.pk = false;
        this.model = Model
        this.previewFields = false;

        /* Get attr and type */
        this.attrs = [];

        for (let i of Object.keys(Model.rawAttributes)){
            if (Model.rawAttributes[i].primaryKey){
                this.pk = Model.rawAttributes[i].fieldName;
            }
            let attr = { refModel: null };
            attr.name = Model.rawAttributes[i].fieldName;
            attr.type = Model.rawAttributes[i].type.key;
            // TODO
            attr.ref = Boolean(Model.rawAttributes[i].references) ? Model.rawAttributes[i].references.model : false;
            attr.refKey = Boolean(Model.rawAttributes[i].references) ? Model.rawAttributes[i].references.key : false;
            this.attrs.push(attr)
        }
        /* End get attr */

        if (this.pk === false)
            throw new AdminPanelError(ErrorCodes.PrimaryKeyNotFound)
    }

    getItemList(options){
        const optionsQ = options || {};
        const offsetQ = optionsQ.offset || 0;
        const limitQ = optionsQ.limit || 100;
        const orderQ = optionsQ.order || this.pk;
        const directQ = optionsQ.direct || 'ASC';
        const fieldQ = optionsQ.attributes || this.previewFields || [this.pk];
        return this.model.findAndCountAll({ limit: limitQ, offset: offsetQ, order: [[orderQ, directQ]], attributes: fieldQ })
            // .then((result)=>{console.log(JSON.stringify(result))})
    }

    getItem(keyValue, options){
        const keyAttr = options.attr || this.pk
        let query = {}
        let includes = []
        let attr = []
        for (let i of this.attrs){
            if (i.ref){
                includes.push({model: i.refModel.model, attributes: [i.refModel.pk] })
            } else {
                attr.push(i.name)
            }
        }
        query[keyAttr] = keyValue;
        return this.model.findOne({attributes: attr, where:query, include:includes})
    }

    setPreviewField(previewFields){
        this.previewFields = previewFields;
    }

    getAttrs(){
        return this.attrs
    }
}

module.exports = { AdminModel: AdminModel }