
const concateCommand = (type, prefix, conditions) =>{
    var cmd = '';
    if (type === 'string') {
        for (const condition of conditions){
            cmd +=  prefix + '\'' + condition  + '\'' + ' OR ';
       }
    } else if (type === 'int'){
        for (const condition of conditions){
           cmd += prefix + condition  + ' OR ';
       }
    }
    console.log(cmd)
    console.log('(' + cmd.substring(0, cmd.length - 4) + ')')
    return '(' + cmd.substring(0, cmd.length - 3) + ')';
}

module.exports = {
    concateCommand
}