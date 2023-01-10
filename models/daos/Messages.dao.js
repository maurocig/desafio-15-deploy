const MongoContainer = require('../containers/Mongodb.container');
const { HttpError } = require('../../utils/api.utils');
const MessageSchema = require('../schemas/Message.schema');
const constants = require('../../constants/api.constants');

const collection = 'Messages';

class MessagesDao extends MongoContainer {
  constructor() {
    super(collection, MessageSchema);
  }

  async createMessage(messageItem) {
    try {
      const message = await this.save(messageItem);
      return message;
    } catch (error) {
      if (
        error.message.toLowerCase().includes('e11000') ||
        error.message.toLowerCase().includes('duplicate')
      ) {
        throw new HttpError(constants.HTTP_STATUS.BAD_REQUEST, 'Message with given email already exist');
      }
      throw new HttpError(constants.HTTP_STATUS.INTERNAL_ERROR, error.message, error);
    }
  }

  async getById(id) {
    try {
      const document = await this.model.findById(id, { __v: 0 }).lean();
      if (!document) {
        const errorMessage = `Resource with id ${id} does not exist in our records`;
        throw new HttpError(constants.HTTP_STATUS.NOT_FOUND, errorMessage);
      } else {
        return document;
      }
    } catch (error) {
      throw new HttpError(constants.HTTP_STATUS.INTERNAL_ERROR, error.message, error);
    }
  }
}

const messagesDao = new MessagesDao();
module.exports = messagesDao;
