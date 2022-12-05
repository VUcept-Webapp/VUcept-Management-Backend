
const {TYPE, STATUS_CODE, SORT_ORDER} = require('../lib/constants');
const connection = require('../models/connection');

//used for creating conditions in where clause 
const concateCommand = (type, prefix, conditions) => {
    var cmd = '';
    if (type === 'string') {
        for (const condition of conditions) {
            cmd += prefix + '\'' + condition + '\'' + ' OR ';
        }
    } else if (type === 'int') {
        for (const condition of conditions) {
            cmd += prefix + condition + ' OR ';
        }
    }
    return '(' + cmd.substring(0, cmd.length - 3) + ')';
}

// Shared functions: insertUser
exports.insertUser = ({email, name, type, visions}) => {
    const query = 'INSERT INTO users (email, name, type, status, visions) VALUES (?,?,?,\'unregistered\',?)';

    const promise = new Promise((resolve, reject) => {
        connection.query(query, [email, name, type, visions], (err, res) => {
            if (err) reject(err);
            else resolve(res);
        })
    });

    return promise;
};

// Shared function: verifyUser
exports.verifyUser = (email) => {
    const queryCheck = 'SELECT COUNT(email) AS NUM FROM users WHERE email = ?';

    const promise = new Promise((resolve, reject) => {
        connection.query(queryCheck, email, (err, res) => {
            if (err) reject(err);
            else resolve(res[0]);
        })
    });

    return promise;
};

// Shared function: removeUser
exports.removeUser = (email) => {
    const query = `DELETE FROM users WHERE email = ?`;

    const promise = new Promise((resolve, reject) => {
        connection.query(query, email, (err, res) => {
            if (err) reject(err);
            else resolve(res);
        })
    });

    return promise;
};

// Shared function: editUser
exports.editUser = ({old_email, email, name, type, visions}) => {
    const query = `UPDATE users SET email = ?, name = ?, type = ?, visions = ? WHERE email = ?;`;

    const promise = new Promise((resolve, reject) => {
        connection.query(query, [email, name, type, visions, old_email], (err, res) => {
            if (err) reject(err);
            else resolve(res);
        })
    });

    return promise;
};

//reset the user table
exports.resetUsers = async (req, res) => {
    const query = 'DELETE FROM users;';

    const reset = new Promise((resolve, reject) => {
        connection.query(query, (err, res) => {
            if (err) reject(err);
            else resolve(res);
        })
    });

    try {
        await reset;
        return res.send({status: STATUS_CODE.SUCCESS});
    } catch (error) {
        return res.send({status: STATUS_CODE.ERROR});
    }
};

//load with csv file
exports.userLoadfromcsv = async (req, res) => {
    if (req.type != TYPE.ADVISER)  {
        return res.send({status : STATUS_CODE.FORBIDDEN})
    }
    const {file} = req.body;
    var duplicates = [];

    // Fetching the data from each row
    // and inserting to the table "sample"
    for (var i = 0; i < file.length; i++) {
        var email = file[i]["email"],
            name = file[i]["name"],
            type = file[i]["type"],
            visions = file[i]["visions"];

        try {
            let verify = await this.verifyUser(email);
            if (verify.NUM > 0) {
                duplicates.push(email);
            } else {
                await this.insertUser({email, name, type, visions});
            }
        } catch (error) {
            return res.send({status: STATUS_CODE.ERROR});
        }
    }

    if (duplicates.length == 0) {
        return res.send({status: STATUS_CODE.SUCCESS});
    } else {
        return res.send({status: STATUS_CODE.EMAIL_USED, result: duplicates});
    }
};

//add one user
exports.createUser = async (req, res) => {
    if (req.type != TYPE.ADVISER)  {
        return res.send({status : STATUS_CODE.FORBIDDEN})
    }
    const {email, name, type, visions} = req.body;

    if ((type != TYPE.ADVISER) && (type != TYPE.BOARD) && (type != TYPE.VUCEPTOR)){
        return res.send({status: STATUS_CODE.INCORRECT_TYPE});
    }

    try {
        let verify = await this.verifyUser(email);
        if (verify.NUM > 0) {
            return res.send({status: STATUS_CODE.EMAIL_USED, result: email});
        }

        let result = await this.insertUser({email, name, type, visions});

        if (result.affectedRows) {
            return res.send({status: STATUS_CODE.SUCCESS});
        }
    } catch (error) {
        return res.send({status: STATUS_CODE.ERROR});
    }

    return res.send({status: STATUS_CODE.ERROR});
};

//edit one user
exports.updateUser = async (req, res) => {
    if (req.type != TYPE.ADVISER)  {
        return res.send({status : STATUS_CODE.FORBIDDEN})
    }
    const {old_email, email, name, type, visions} = req.body;

    try {
        let result = await this.editUser({old_email, email, name, type, visions});
        return res.send({status: STATUS_CODE.SUCCESS});
    } catch (error) {
        return res.send({status: STATUS_CODE.ERROR});
    }

};

//delete one user
exports.deleteUser = async (req, res) => {
    if (req.type != TYPE.ADVISER)  {
        return res.send({status : STATUS_CODE.FORBIDDEN})
    }
    try {
        const email = req.body.email;
        let verify = await this.verifyUser(email);

        if (verify.NUM == 0) {
            return res.send({
                status: STATUS_CODE.INCORRECT_USER_EMAIL,
                result: email
            });
        }

        let result = await this.removeUser(email);
        if (result.affectedRows) {
            return res.send({status: STATUS_CODE.SUCCESS});
        }
    } catch (error) {
        return res.send({status: STATUS_CODE.ERROR});
    }
    return res.send({status: STATUS_CODE.SUCCESS});
};

//get all first year students, return a json object
exports.readUser = async (req, res) => {
    if (req.type != TYPE.ADVISER)  {
        return res.send({status : STATUS_CODE.FORBIDDEN})
    }
    const name_sort = (!req.query.name_sort) ? '' : ' name ' + req.query.name_sort;
    const email_sort = (!req.query.email_sort) ? '' : ' email ' + req.query.email_sort;
    const visions_sort = (!req.query.visions_sort) ? '' : ' visions ' + req.query.visions_sort;
    const condition_order = (!req.query.condition_order) ? null : JSON.parse(req.query.condition_order);

    // pass in array for all search/filtering options
    const name_search = (!req.query.name_search) ? '' : {type: 'string', data: JSON.parse(req.query.name_search)};
    const email_search = (!req.query.email_search) ? '' : {type: 'string', data: JSON.parse(req.query.email_search)};
    const visions_filter = (!req.query.visions_filter) ? '' : {type: 'int', data: JSON.parse(req.query.visions_filter)};
    const status_filter = (!req.query.status_filter) ? '' : {type: 'string', data: JSON.parse(req.query.status_filter)};
    const type_filter = (!req.query.type_filter) ? '' : {type: 'string', data: JSON.parse(req.query.type_filter)};

    const row_start = (!req.query.row_start) ? 0 : req.query.row_start;
    const row_num = (!req.query.row_num) ? 50 : req.query.row_num;

    // check parameters: sort
    const sort_list = [req.query.name_sort, req.query.email_sort, req.query.visions_sort];
    for (var i = 0; i < sort_list.length; ++i) {
        if (sort_list[i] && (sort_list[i] !== SORT_ORDER.ASC) && (sort_list[i] !== SORT_ORDER.DESC)) {
            console.log("SORT ERROR\n");
            return res.send({status: STATUS_CODE.UNKNOWN_SORT});
        }
    }

    // create where string
    var tempWhere = ' WHERE ';
    const where_list = [name_search, email_search, status_filter, type_filter, visions_filter];
    const prefix_list = ['name = ', 'email = ', 'status = ', 'type = ', 'visions = '];
    for (let i = 0; i < where_list.length; i++) {
        const where_data = where_list[i];
        if (where_data !== '') {
            tempWhere += concateCommand(where_data.type, prefix_list[i], where_data.data) + ' AND ';
        }
    }
    var where = '';
    if (tempWhere !== ' WHERE ') {
        where = tempWhere.startsWith(' AND ', tempWhere.length - 5) ? tempWhere.substring(0, tempWhere.length - 4) : tempWhere;
    }

    // create orderBy string
    // ORDER BY A, B will first order database by A, if A is the same then order by B
    // if condition_order is given, it will only contain sorting conditions within condition_order
    var tempOrderBy = ' ORDER BY ';
    if (condition_order) {
        for (const condition of condition_order) {
            switch (condition) {
                case "name_sort":
                    tempOrderBy += name_sort + ',';
                    break;
                case "email_sort":
                    tempOrderBy += email_sort + ',';
                    break;
                case "visions_sort":
                    tempOrderBy += visions_sort + ',';
                    break;
            }
        }
    }

    const orderBy = (tempOrderBy === ' ORDER BY ') ? '' : tempOrderBy.substring(0, tempOrderBy.length - 1);

    const query = 'SELECT name, email, visions, type, status FROM users' + where + orderBy +
        ' LIMIT ' + row_num + ' OFFSET ' + row_start;
    const viewusers = new Promise((resolve, reject) => {
        connection.query(query, (err, res) => {
            if (err) reject(err);
            else resolve(res);
        })
    });

    //calculate the number of pages
    const queryCount = "SELECT COUNT(*) AS count FROM users" + where;
    const pageCount = new Promise((resolve, reject) => {
        connection.query(queryCount, (err, res) => {
            if (err) reject(err);
            else resolve(Math.ceil(res[0].count / row_num));
        })
    });

    try {
        var rows = await viewusers;
        var pages = await pageCount;
        return res.send({status: STATUS_CODE.SUCCESS, result: {rows, pages}});
    } catch (error) {
        return res.send({status: STATUS_CODE.ERROR});
    }
};

// return empty list when no value is found in DB
// return the max Visions group number
exports.visionsNums = async (req, res) => {
    const query = 'SELECT DISTINCT visions FROM users ORDER BY visions ASC';

    const returnMaxVisions = new Promise((resolve, reject) => {
        connection.query(query, (err, res) => {
            if (err) reject(err);
            else resolve(res);
        })
    });

    try {
        let maxVisions = await returnMaxVisions;
        return res.send({
            status: STATUS_CODE.SUCCESS,
            result: {list: maxVisions}
        });
    } catch (error) {
        return res.send({status: STATUS_CODE.ERROR});
    }
};
