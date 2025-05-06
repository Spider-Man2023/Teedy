package com.sismics.docs.core.dao.jpa;
import java.util.Date;

import org.junit.Test;

import com.sismics.docs.BaseTransactionalTest;
import com.sismics.docs.core.dao.DocumentDao;
import com.sismics.docs.core.model.jpa.Document;
import com.sismics.docs.core.model.jpa.User;

public class TestCreate extends BaseTransactionalTest{
    @Test
    public void testDocDaoCreate() throws Exception {
        User user = createUser("cc");
        String userId = user.getId();
        String title = "cc";
        Document document = new Document();
        document.setUserId(userId);
        document.setTitle(title);
        document.setLanguage("eng");
        document.setCreateDate(new Date());
        document.setUpdateDate(new Date());

        DocumentDao documentDao = new DocumentDao();
        String doc_id = documentDao.create(document, userId);
        System.out.println(doc_id);
    }
}
