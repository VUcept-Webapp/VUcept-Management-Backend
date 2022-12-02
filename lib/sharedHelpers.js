const {ATTENDANCE} = require('./constants');

/**
 * helper function to form the search conditions for attendance reading
 * @param {string} type 
 * @param {string} prefix 
 * @param {string} conditions 
 * @returns the consolidated search where string
 */
exports.concateCommand = (type, prefix, conditions) => {
    var cmd = '';
    if (type === 'string') {
        for (const condition of conditions) {
            //if attendance is null, there is a different grammar (IS NULL instead of = NULL)
            if (condition === ATTENDANCE.NON_LOGGED){
                cmd += " attendance IS NULL OR ";
            } else {
                cmd += prefix + '\'' + condition + '\'' + ' OR ';
            }
        }
    } else if (type === 'int') {
        for (const condition of conditions) {
            cmd += prefix + condition + ' OR ';
        }
    }
    return '(' + cmd.substring(0, cmd.length - 3) + ')';
}