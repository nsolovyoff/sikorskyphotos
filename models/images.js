const fs = require('fs-promise');
const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    img: { type: String, required: true },
    name: { type: String, required: true },
    img_id: { type: String, required: true },
    likes: { type: Number, required: true },
    added: { type: String, default: new Date().toISOString()},
    users: [{ type: String, required: true }],
    owner: { type: String, required: true }
});

const ImageModel = mongoose.model('Image',ImageSchema);

class Image {
    static insert(x){
        return new ImageModel(x).save();
    }

    static update(x){
        return ImageModel.findByIdAndUpdate(x.id,x);
    }

    static delete(id){
        console.log("delete " + id);
        return ImageModel.findByIdAndDelete(id);
    }

    static shareImage(imageId, username) {
        console.log("dannie" + imageId);
        console.log("dannie" + username);

        return ImageModel.update(
            { _id: imageId },
            { $push: { users: username } }
        );
    }

    static getAll(){
        return ImageModel.find();
    }

    static imageGetOwned(username) {
        return ImageModel.find({ users: username, owner: username });
    }

    static imageGetAccessible(username) {
        return ImageModel.find({ users: username, owner: {$ne: username}});
    }

    static getById(id){
        return ImageModel.findById(id);
    }
}

module.exports = Image;