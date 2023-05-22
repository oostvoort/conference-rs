use std::sync::Weak;

/// Similar to `Room`, but doesn't prevent room from being destroyed
#[derive(Debug, Clone)]
pub struct WeakRoom {
    pub inner: Weak<super::inner::Inner>,
}

impl WeakRoom {
    /// Upgrade `WeakRoom` to `Room`, may return `None` if underlying room was destroyed already
    pub fn upgrade(&self) -> Option<super::Room> {
        self.inner.upgrade().map(|inner| super::Room { inner })
    }
}