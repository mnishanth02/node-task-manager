const mongoose = require('mongoose');



mongoose.connect(process.env.MONGOOSEDB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})


