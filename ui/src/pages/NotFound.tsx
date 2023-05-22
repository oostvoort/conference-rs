// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const headingVariants = {
        hidden: { y: -100, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    const messageVariants = {
        hidden: { y: 100, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    const buttonVariants = {
        hidden: { scale: 0 },
        visible: { scale: 1 },
    };

    return (
        <motion.div
            className="full-page flex flex-col justify-center items-center bg-black text-white"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            transition={{ duration: 0.5 }}
        >
            <img
                src="assets/ov_conf_logo.png"
                alt="Logo"
                className="w-60 h-30 mb-4"
            />
            <motion.h1
                className="text-9xl font-bold text-green-500 mb-8"
                variants={headingVariants}
                transition={{ delay: 0.2 }}
            >
                404
            </motion.h1>
            <motion.p
                className="text-3xl font-bold mb-12"
                variants={messageVariants}
                transition={{ delay: 0.4 }}
            >
                Oops! Page not found.
            </motion.p>
            <motion.a
                href="/"
                className="px-6 py-3 bg-green-500 rounded transition-colors duration-300 ease-in-out hover:bg-green-700"
                variants={buttonVariants}
                transition={{ delay: 0.6 }}
            >
                Go to Home
            </motion.a>
        </motion.div>
    );
};

export default NotFoundPage;
