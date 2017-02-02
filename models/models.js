'use strict';
const Sequelize = require('sequelize')
const opts = {
    define: {
        freezeTableName: true
    },
    //logging: false,
}

const sequelize = new Sequelize('postgres://domovenok:domovenokPG@localhost:5432/pancake', opts);


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
    { scopes: { active: { where: {active: true}}}
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
    uuid: {type: Sequelize.UUID, primaryKey: true},
    title: Sequelize.STRING,
    domain: Sequelize.STRING,
    keyword: Sequelize.STRING,
    active: {type: Sequelize.BOOLEAN}
});

const Token = sequelize.define('tokens', {
    uuid: {type: Sequelize.UUID, primaryKey: true},
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
        references: {
            model: Employee,
            key: 'uuid',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
    client_uuid: {
        type: Sequelize.UUID,
        references: {
            model: Client,
            key: 'uuid',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
    active: {type: Sequelize.BOOLEAN, allowNull: false},

});


const Phone = sequelize.define('phones', {
    uuid: {type: Sequelize.UUID, primaryKey: true},
    number: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    city_uuid: {
        type: Sequelize.UUID,
        references: {
            model: City,
            key: 'uuid',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
    user_uuid: {
        type: Sequelize.UUID,
        references: {
            model: User,
            key: 'uuid',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
    active: {type: Sequelize.BOOLEAN}
});

const Visit = sequelize.define('visits', {
    uuid: {type: Sequelize.UUID, primaryKey: true},
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

const Event = sequelize.define('events', {
    uuid: {type: Sequelize.UUID, primaryKey: true},
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
    uuid: {type: Sequelize.UUID, primaryKey: true},
    data: Sequelize.JSON,
    event_uuid: {
        allowNull: false,
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
}