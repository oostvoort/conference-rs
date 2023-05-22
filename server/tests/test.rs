#[cfg(test)]
mod tests {
    use yrs::{Doc, GetString, ReadTxn, StateVector, Text, Transact, Update};
    use yrs::updates::decoder::Decode;
    use yrs::updates::encoder::Encode;

    #[tokio::test]
    async fn  simple_text_insertions() {
        // Doc is a core structure of Yrs. All other structures and operations are performed in context of their document
        let doc = Doc::new();
        let text = doc.get_or_insert_text("article");

        {
            let mut txn = doc.transact_mut();
            text.insert(&mut txn, 0, "hello");
            text.insert(&mut txn, 5, " world");
            // other rich text operations include formatting or inserting embedded elements
        } // transaction is automatically committed when dropped

        let x = &doc.transact();

        dbg!(&x);

        let string = text.get_string(x);

        dbg!(&string);
        assert_eq!(string, "hello world".to_owned());

        // synchronize state with remote replica
        let remote_doc = Doc::new();
        let remote_text = remote_doc.get_or_insert_text("article");
        let remote_timestamp = remote_doc.transact().state_vector().encode_v1();

        // get update with contents not observed by remote_doc
        let update = doc.transact().encode_diff_v1(&StateVector::decode_v1(&remote_timestamp).unwrap());
        // apply update on remote doc
        remote_doc.transact_mut().apply_update(Update::decode_v1(&update).unwrap());

        assert_eq!(text.get_string(&doc.transact()), remote_text.get_string(&remote_doc.transact()));
    }
}
