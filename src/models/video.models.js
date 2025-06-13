// id string pk
//   owner ObjectId users
//   videoFile string
//   thumbnail string
//   title string
//   description string
//   duration number
//   views number
//   isPublished boolean
//   createdAt Date
//   updatedAt Date
import mongoose, {Schema} from "mongoose"
import mongooseAggregatePaginate from " ";
const videoSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        videoFile: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ''
        },
        duration: {
            type: Number,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate); 
export const video = mongoose.model('Video',videoSchema);
