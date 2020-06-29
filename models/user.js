const fs = require('fs-promise');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    login: { type: String, required: true },
    fullname: { type: String },
    password: { type: String },
    role: { type : Number },
    avaUrl: { type: String },
    bio: { type: String },
    isDisabled: { type: Boolean },
    registeredAt: { type: String, default: new Date().toISOString() },
    albums: [{ type: mongoose.Schema.Types.ObjectId,ref : "Album"}]
});

const UserModel = mongoose.model('User',UserSchema);

class User {
    constructor (login,password,fullname,role,avaUrl,bio,isDisabled,albums){
        this.login = login;
        this.password = password;
        this.fullname = fullname;
        this.role = role;
        this.avaUrl = avaUrl;
        this.bio = bio;
        this.isDisabled = isDisabled;
        this.albums = albums;

    }

    static getById(id){
        return UserModel.findOne({ _id : id});

    }
    static getByLogin(login){
        return UserModel.findOne({ login : login});

    }

    static getAll(){
        return UserModel.find();
    }

    static insert(user){

        return new UserModel(user).save();
    }
    static deleteAlbumById(id){
        return UserModel.updateMany({}, { $pull: { albums:  id} });
    }
    static addAlbumById(userId,collId){
        return UserModel.updateOne({"_id": userId}, { $push: { albums:  collId} });
    }

    static isUniqueUsername(login){
        return UserModel.findOne({ login : login});
    }
    static getUserByLoginAndPassword(login, password) {

        return UserModel.findOne({ login : login, password: password});

    }
    static upgradeToAdmin(login){
        return UserModel.updateOne({login : login},{ $set: { role: 1 } })
    }

}
module.exports = User;