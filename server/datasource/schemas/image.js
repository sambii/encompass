var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  _ = require('underscore'),
  ObjectId = Schema.ObjectId;

/**
  * @public
  * @class Image
  * @description Images are text documents based on selections and comments
  */
var ImageSchema = new Schema({
  //== Shared properties (Because Mongoose doesn't support schema inheritance)
  createdBy: { type: ObjectId, ref: 'User' },
  createDate: { type: Date, 'default': Date.now() },
  isTrashed: { type: Boolean, 'default': false },
  //====
  originalName: { type: String },
  encoding: { type: String },
  mimetype: { type: String },
  destination:  { type: String },
  filename: { type: String },
  path: { type: String },
  relativePath: { type: String }
}, { versionKey: false });

/**
  * ## Pre-Validation
  * Before saving we must verify (synchonously) that:
  */
// ImageSchema.pre('save', function (next) {
//   var toObjectId = function (elem, ind, arr) {
//     if (!(elem instanceof mongoose.Types.ObjectId) && !_.isUndefined(elem)) {
//       arr[ind] = mongoose.Types.ObjectId(elem);
//     }
//   };

//   /** + Every ID reference in our object is properly typed.
//     *   This needs to be done BEFORE any other operation so
//     *   that native lookups and updates don't fail.
//     */
//   try {
//     this.selections.forEach(toObjectId);
//     this.comments.forEach(toObjectId);
//     next();
//   }
//   catch (err) {
//     next(new Error(err.message));
//   }
// });

/**
  * ## Post-Validation
  * After saving we must ensure (synchonously) that:
  */
// ImageSchema.post('save', function (Image) {
//   var update = { $addToSet: { 'Images': Image } };
//   if (Image.isTrashed) {
//     var ImageIdObj = mongoose.Types.ObjectId(Image._id);
//     /* + If deleted, all references are also deleted */
//     update = { $pull: { 'Images': ImageIdObj } };
//   }

//   if (Image.workspace) {
//     mongoose.models.Workspace.update({ '_id': Image.workspace },
//       update,
//       function (err, affected, result) {
//         if (err) {
//           throw new Error(err.message);
//         }
//       });
//   }

//   if (Image.submission) {
//     mongoose.models.Submission.update({ '_id': Image.submission },
//       update,
//       function (err, affected, result) {
//         if (err) {
//           throw new Error(err.message);
//         }
//       });
//   }

// });

module.exports.Image = mongoose.model('Image', ImageSchema);