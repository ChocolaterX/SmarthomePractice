var userModel = require('../../model/user');

function insert() {
    var userEntity = new userModel({
        username: 'lisi',
        password: 'abcdefg',
        userNumber: '1800125001'
    });

    userEntity.save(function (err, result) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(result);
        }
    })

}

// insert();


