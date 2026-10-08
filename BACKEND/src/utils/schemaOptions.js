export const makeSchemaOptions = (extraRemoveFields = []) => ({
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            extraRemoveFields.forEach((field) => delete ret[field]);
            return ret;
        }
    }
});