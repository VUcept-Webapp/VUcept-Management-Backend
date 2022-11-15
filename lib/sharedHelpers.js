//used for creating conditions in where clause 
exports.concateCommand = (type, prefix, conditions) => {
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