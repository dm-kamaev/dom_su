'use strict';
const Sequelize = require('sequelize')
const moment = require('moment')
const config = require('config');
const opts = {
    timezone: '+03:00',
    define: {
        freezeTableName: true,
    },
    //logging: false,
}

const sequelize = new Sequelize(`postgres://${config.db.user}:${config.db.password}@${config.db.host}:5432/${config.db.database}`, opts);


const EmployeeNews = sequelize.define('employee_news', {
    title: Sequelize.STRING,
    text: Sequelize.TEXT,
    text_m: Sequelize.TEXT,
    active: Sequelize.BOOLEAN
})

const FAQ = sequelize.define('faq', {
    name: Sequelize.STRING,
    pub_date: {
    type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
    },
    question: Sequelize.TEXT,
    answer: Sequelize.TEXT,
    block_link: {type: Sequelize.TEXT, defaultValue: null},
    active: Sequelize.BOOLEAN,
    mail: Sequelize.STRING,
    title_meta: Sequelize.STRING,
    description_meta: Sequelize.STRING,
    keywords_meta: Sequelize.STRING,
    h1_text: Sequelize.STRING,
    note: Sequelize.TEXT,
    }, {
        scopes: {active: {where: {active: true}}}
    }
)

const Picture = sequelize.define('pictures', {
    title: Sequelize.STRING,
    pic: Sequelize.STRING
})

const Article = sequelize.define('articles', {
        title: Sequelize.STRING,
        pub_date: Sequelize.DATEONLY,
        picture_id: {
            type: Sequelize.INTEGER,
            references: {
                model: Picture,
                key: 'id',
                deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
            }
        },
        preview_text: Sequelize.TEXT,
        full_text: Sequelize.TEXT,
        active: Sequelize.BOOLEAN,
        url: Sequelize.STRING,
        title_meta: Sequelize.STRING,
        description_meta: Sequelize.STRING,
        keywords_meta: Sequelize.STRING,
    },
    {
        scopes: {active: {where: {active: true}}}
    },
    {
        indexes: [
            {
                unique: true,
                fields: ['url']
            }]
    });

const Client = sequelize.define('clients', {
    uuid: {type: Sequelize.UUID, primaryKey: true},
    data: Sequelize.JSON,
});

const User = sequelize.define('users', {
    uuid: {type: Sequelize.UUID, primaryKey: true},
    data: Sequelize.JSON,
});

const Employee = sequelize.define('employees', {
    uuid: {type: Sequelize.UUID, primaryKey: true},
    data: Sequelize.JSON
});

const City = sequelize.define('cities', {
    title: Sequelize.STRING,
    domain: Sequelize.STRING,
    keyword: Sequelize.STRING,
    phone: Sequelize.STRING,
    active: {type: Sequelize.BOOLEAN}
});

const News = sequelize.define('news', {
        title: Sequelize.STRING,
        pub_date: Sequelize.DATEONLY,
        picture_id: {
            type: Sequelize.INTEGER,
            references: {
                model: Picture,
                key: 'id',
                deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
            }
        },
        preview_text: Sequelize.TEXT,
        full_text: Sequelize.TEXT,
        active: Sequelize.BOOLEAN,
        url: Sequelize.STRING,
        title_meta: Sequelize.STRING,
        description_meta: Sequelize.STRING,
        keywords_meta: Sequelize.STRING,
        city_id: {
            type: Sequelize.INTEGER,
            references: {
                model: City,
                key: 'id',
                deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
            }
        },
    },
    {
        scopes: {active: {where: {active: true}}}
    },
    {
        indexes: [
            {
                unique: true,
                fields: ['url']
            }]
    }
)

const Token = sequelize.define('tokens', {
    uuid: {type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4},
    token: {type: Sequelize.UUID, allowNull: false},
    user_uuid: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
            model: User,
            key: 'uuid',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
    employee_uuid: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
            model: Employee,
            key: 'uuid',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
    client_uuid: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
            model: Client,
            key: 'uuid',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
    active: {type: Sequelize.BOOLEAN, allowNull: false},

});

const Ticket = sequelize.define('tickets', {
    data: Sequelize.JSON,
    type: Sequelize.STRING,
    isSend: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
}, {
    instanceMethods: {
        buildMessage: function (UTMS) {
            UTMS = UTMS || []
            let textTicket = {action: "NewOnlineObjects", param: [{utms: UTMS, type: this.type, data: this.data}]}
            if (!textTicket.param[0].data.date){
                textTicket.param[0].data.date = moment(this.createdAt).toISOString()
            }
            return JSON.stringify(textTicket)
        }
    }
})

const Phone = sequelize.define('phones', {
    key: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    number: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    city_id: {
        type: Sequelize.INTEGER,
        references: {
            model: City,
            key: 'id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
    living: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    user_uuid: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
            model: User,
            key: 'uuid',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
    active: {type: Sequelize.BOOLEAN}
}, {
    classMethods: {
        attributesInternalAPI: function () {
            return ['key', 'number', 'active']
        },
        includeInternalAPI: function () {
            return [{model: City, attributes: ['keyword']}]
        },
        formatResultIntenralAPI: function (data) {
          return data.map((item)=>{return {key: item.key, number: item.number, active: item.active, city: item.city.keyword}})
        },
        createInternalAPI: async function (data) {
            let city = await City.findOne({where: {keyword: data.city}})
            await Phone.create({city_id: city.id, number: data.number, living: false, user_uuid: null, active: data.active})
        },
    },
    instanceMethods: {
        updateInternalAPI: async function (data){
            this.number = data.number
            this.active = data.active
            let city = await City.findOne({where: {keyword: data.city}})
            this.city_id = city.id
            await this.save()
        }
    }
});

Phone.belongsTo(City, { foreignKey: 'city_id' })

const Visit = sequelize.define('visits', {
    uuid: {type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4},
    user_uuid: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
            model: User,
            key: 'uuid',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
    active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
    },
    begin: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
    },
    end: Sequelize.DATE,
    data: Sequelize.JSON,
})

const Review = sequelize.define('reviews', {
    name: Sequelize.STRING,
    date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
    },
    age: Sequelize.STRING,
    job: Sequelize.STRING,
    mail: Sequelize.STRING,
    rating: Sequelize.INTEGER,
    review: Sequelize.TEXT,
    answer: Sequelize.TEXT,
    active: Sequelize.BOOLEAN,
    send_on_save: Sequelize.BOOLEAN,
    block_link: {type: Sequelize.TEXT, defaultValue: null},
    last_modified: Sequelize.DATE,
    note: Sequelize.TEXT,
    title_meta: Sequelize.STRING,
    description_meta: Sequelize.STRING,
    keywords_meta: Sequelize.STRING,
    isOld: Sequelize.BOOLEAN,
    city_id: {
            type: Sequelize.INTEGER,
            references: {
                model: City,
                key: 'id',
                deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
            }
    },
}, {
    scopes: {active: {where: {active: true}}}
})

const Event = sequelize.define('events', {
    uuid: {type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4},
    date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
    },
    visit_uuid: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
            model: Visit,
            key: 'uuid',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
    token_uuid: {
        type: Sequelize.UUID,
        references: {
            model: Token,
            key: 'uuid',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
    data: Sequelize.JSON,
    type: Sequelize.STRING,
})

const UTMS = sequelize.define('utms', {
    uuid: {type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4},
    data: Sequelize.JSON,
    event_uuid: {
        allowNull: true,
        type: Sequelize.UUID,
        references: {
            model: Event,
            key: 'uuid',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
    user_uuid: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
            model: User,
            key: 'uuid',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
})


const Payment = sequelize.define('payments', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    create_time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
    },
    OrderId: Sequelize.STRING,
    PaymentId: Sequelize.STRING,
    Amount: Sequelize.BIGINT,
    IP: Sequelize.STRING,
    Description: Sequelize.TEXT,
    Token: Sequelize.STRING,
    CustomerKey: Sequelize.STRING,
    DATA: Sequelize.TEXT,
    initial: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    notification: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    success: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    redirectNewSite: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    redirectPath: Sequelize.TEXT,
    }
)

sequelize.sync()

module.exports = {
    Phone: Phone,
    Article: Article,
    Picture: Picture,
    Client: Client,
    Token: Token,
    UTMS: UTMS,
    Employee: Employee,
    City: City,
    User: User,
    Visit: Visit,
    Event: Event,
    FAQ: FAQ,
    Review: Review,
    News: News,
    Ticket: Ticket,
    Payment: Payment,
    EmployeeNews: EmployeeNews
}