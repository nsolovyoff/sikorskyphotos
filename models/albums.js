const mongoose = require('mongoose');
const User = require("./user");

const AlbumSchema = new mongoose.Schema({
    name: { type: String, required: true },
    images: [{ type: mongoose.Schema.Types.ObjectId,ref : "Image"}],
    added: { type: String, default: new Date().toISOString() },
    users: [{ type: String, required: true }],
    owner: { type: String, required: true }
});

const AlbumModel = mongoose.model('Album',AlbumSchema);

class Album {
    constructor (name,images){
        this.name = name;
        this.images = images;
    }

    static insert(album){
        return new AlbumModel(album).save();
    }

    static delete(id){
        console.log("deleting " + id);
        return AlbumModel.findByIdAndDelete(id)
            .then(() => User.deleteAlbumById(id))
    }

    static deleteAlbumById(id){
        return AlbumModel.updateMany({}, { $pull: { images:  id} });
    }

    static albumGetOwned(username) {
        return AlbumModel.find({ users: username, owner: username });
    }

    static albumGetAccessible(username) {
        return AlbumModel.find({ users: username, owner: {$ne: username}});
    }

    static getAll(){
        return AlbumModel.find();
    }

    static getById(id){
        return AlbumModel.findById(id);

    }
}

module.exports = Album;

