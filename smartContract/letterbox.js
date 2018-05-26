"use strict";

var LetterTitle = function(input) {
  this.title = !input ? "" : input;
};

var LetterItem = function(jsonStr) {
  if (!!jsonStr) {
    var json = JSON.parse(jsonStr);
    this.date = json.date;
    this.receiver = json.receiver;
    this.title = json.title;
    this.content = json.content;
    this.email = json.email;
    this.isPublic = json.isPublic;
  } else {
    this.date = "";
    this.receiver = "";
    this.title = "";
    this.content = "";
    this.email = "";
    this.isPublic = true;
  }
};

function Letterbox() {
  LocalContractStorage.defineMapProperty(this, "letterRepo");
  LocalContractStorage.defineMapProperty(this, "titleRepo");
  LocalContractStorage.defineProperty(this, "authors");
  LocalContractStorage.defineProperty(this, "pageNum");
  //   this.letterRepo=new Map();
  //   this.titleRepo=new Map();
}

Letterbox.prototype = {
  init: function() {
    // todo
    this.pageNum = 50;
    this.authors = [];
  },

  save: function(title, content, receiver, date, email, ispublic) {
    if (!title || !content || !receiver) {
      throw new Error("title, content and receiver could not be empty.");
    }
    var from = Blockchain.transaction.from;

    var _authors=this.authors;
    if (_authors.indexOf(from) == -1) {
      _authors.push(from);
      this.authors = _authors;//store authors to blockchain storage
    }

    var myTitles = this.titleRepo.get(from);
    if (!myTitles) {
      myTitles = [title];
    } else {
      myTitles.push(title);
    }
    this.titleRepo.set(from, myTitles);

    var letterItem = this._createLetter(
      title,
      content,
      receiver,
      date,
      email,
      ispublic
    );
    var myLetters = this.letterRepo.get(from);
    if (!myLetters) {
      myLetters = [letterItem];
    } else {
      myLetters.push(letterItem);
    }
    this.letterRepo.set(from, myLetters);
  },

  getLetter: function(author, title) {
    var index = this.titleRepo.get(author).indexOf(title);
    return this.letterRepo.get(author)[index];
  },

  getTitles: function(author) {
    return this.titleRepo.get(author);
  },

  //分页获取钱包信息
  getAuthors: function(pageIndex) {
    var page = parseInt(pageIndex);
    page = page === 0 || !page ? 1 : page;
    var maxPage = this.getTotalPage(); //最大页数

    var result = [];
    if (maxPage === 0) {
      return result;
    }
    //超出页码则循环回到第一页
    page = page > maxPage ? page - maxPage : page;
    //返回指定页记录
    var start = (page - 1) * this.pageNum;
    var end =
      this.authors.length > page * this.pageNum
        ? page * this.pageNum
        : this.authors.length;
    var num = end - start; //num为计算该页有多少条记录
    var list = this.authors || [];
    for (var i = num - 1; i >= 0; i--) {
      result.push(list[start + i]);
    }
    return result;
  },

  //获取总页数
  getTotalPage: function() {
    var maxPage = parseInt(this.authors.length / this.pageNum);
    maxPage = this.authors.length % this.pageNum === 0 ? maxPage : maxPage + 1;
    return maxPage;
  },

  _createLetter: function(title, content, receiver, date, email, ispublic) {
    var letterItem = new LetterItem();
    letterItem.title = title;
    letterItem.content = content;
    letterItem.receiver = receiver;
    letterItem.date = !date ? "" : date;
    letterItem.email = !email ? "" : email;
    letterItem.isPublic = ispublic == true || ispublic == "true";
    return letterItem;
  }
};
module.exports = Letterbox;
