-- 医院管理系统用户表创建SQL
-- 表名: h_user_tb (包含医生和其他用户信息)

CREATE TABLE `h_user_tb` (
  `user_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `work_number` VARCHAR(100) NOT NULL COMMENT '工号',
  `username` VARCHAR(100) NOT NULL COMMENT '医生姓名',
  `password` VARCHAR(100) NOT NULL COMMENT '密码',
  `gender` INT NOT NULL COMMENT '性别 0:男; 1:女; 默认0',
  `age` INT NOT NULL COMMENT '年龄',
  `jt_id` BIGINT NOT NULL COMMENT '职称id',
  `department_id` BIGINT NOT NULL COMMENT '科室id',
  `major_direct` VARCHAR(100) DEFAULT NULL COMMENT '专业方向',
  `phone` VARCHAR(100) DEFAULT NULL COMMENT '电话',
  `enter_date` DATETIME DEFAULT NULL COMMENT '入职时间 格式: yyyy-MM-dd',
  `status` INT DEFAULT 0 COMMENT '状态 0:在岗; 1:休假; 2:停职 默认0',
  `description` TEXT DEFAULT NULL COMMENT '备注',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_work_number` (`work_number`) COMMENT '工号唯一索引',
  UNIQUE KEY `uk_username` (`username`) COMMENT '用户名唯一索引',
  KEY `idx_department_id` (`department_id`) COMMENT '科室ID索引',
  KEY `idx_jt_id` (`jt_id`) COMMENT '职称ID索引',
  KEY `idx_status` (`status`) COMMENT '状态索引',
  KEY `idx_enter_date` (`enter_date`) COMMENT '入职时间索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表(包含医生和其他用户信息)';

-- 插入示例数据
INSERT INTO `h_user_tb` (
  `work_number`, `username`, `password`, `gender`, `age`, `jt_id`, `department_id`, 
  `major_direct`, `phone`, `enter_date`, `status`, `description`
) VALUES 
('D001', '张主任', '$2a$10$N.zmdr9k7uOCQb96VdodWu', 0, 45, 1, 1, '心血管内科', '13800138001', '2020-01-15 00:00:00', 0, '心血管科主任医师'),
('D002', '李医生', '$2a$10$N.zmdr9k7uOCQb96VdodWu', 1, 35, 2, 1, '心血管内科', '13800138002', '2021-03-20 00:00:00', 0, '副主任医师'),
('D003', '王医生', '$2a$10$N.zmdr9k7uOCQb96VdodWu', 0, 30, 3, 2, '骨科', '13800138003', '2022-06-10 00:00:00', 0, '主治医师'),
('D004', '赵护士长', '$2a$10$N.zmdr9k7uOCQb96VdodWu', 1, 40, 4, 3, '护理', '13800138004', '2019-08-25 00:00:00', 0, '护士长'),
('A001', '管理员', '$2a$10$N.zmdr9k7uOCQb96VdodWu', 0, 35, 5, 4, '系统管理', '13800138005', '2020-01-01 00:00:00', 0, '系统管理员');

-- 创建职称表 (根据图片结构)
CREATE TABLE IF NOT EXISTS `h_job_title_tb` (
  `jt_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '职称id',
  `jt_name` VARCHAR(100) NOT NULL COMMENT '职称',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`jt_id`),
  UNIQUE KEY `uk_jt_name` (`jt_name`) COMMENT '职称名称唯一索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='职称表';

-- 插入职称数据
INSERT INTO `h_job_title_tb` (`jt_id`, `jt_name`) VALUES 
(1, '主任医师'),
(2, '副主任医师'),
(3, '主治医师'),
(4, '住院医师'),
(5, '护士长'),
(6, '主管护师'),
(7, '护师'),
(8, '护士'),
(9, '系统管理员'),
(10, '药师'),
(11, '主管药师'),
(12, '副主任药师'),
(13, '主任药师'),
(14, '技师'),
(15, '主管技师');

-- 创建科室类型表 (根据图片结构)
CREATE TABLE IF NOT EXISTS `h_department_class` (
  `dc_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '科室类型id',
  `dc_name` VARCHAR(100) NOT NULL COMMENT '科室名称',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`dc_id`),
  UNIQUE KEY `uk_dc_name` (`dc_name`) COMMENT '科室类型名称唯一索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='科室类型表';

-- 插入科室类型数据
INSERT INTO `h_department_class` (`dc_id`, `dc_name`) VALUES 
(1, '内科'),
(2, '外科'),
(3, '妇产科'),
(4, '儿科'),
(5, '急诊科'),
(6, '麻醉科'),
(7, '影像科'),
(8, '检验科'),
(9, '药剂科'),
(10, '护理部'),
(11, '行政管理'),
(12, '后勤保障');

-- 创建科室表 (根据图片结构)
CREATE TABLE IF NOT EXISTS `h_department_tb` (
  `department_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '科室id',
  `department_name` VARCHAR(100) NOT NULL COMMENT '科室名称',
  `dc_id` BIGINT NOT NULL COMMENT '科室类型id',
  `department_code` VARCHAR(100) NOT NULL COMMENT '科室代码',
  `primary_doctor_name` VARCHAR(100) DEFAULT NULL COMMENT '主任医生姓名',
  `department_title` VARCHAR(100) DEFAULT NULL COMMENT '科室职称',
  `status` VARCHAR(100) DEFAULT '0' COMMENT '状态 0: 正常运行; 1: 维护中; 2: 暂停服务等默认0',
  `description` TEXT DEFAULT NULL COMMENT '科室描述',
  `crate_date` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '成立年份 格式: 2023',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `uk_department_code` (`department_code`) COMMENT '科室代码唯一索引',
  UNIQUE KEY `uk_department_name` (`department_name`) COMMENT '科室名称唯一索引',
  KEY `idx_dc_id` (`dc_id`) COMMENT '科室类型ID索引',
  KEY `idx_status` (`status`) COMMENT '状态索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='科室表';

-- 插入科室数据
INSERT INTO `h_department_tb` (`department_id`, `department_name`, `dc_id`, `department_code`, `primary_doctor_name`, `department_title`, `status`, `description`, `crate_date`) VALUES 
(1, '心血管内科', 1, 'CARDIO001', '张主任', '心血管内科主任', '0', '专业从事心血管疾病的诊断和治疗', '2020-01-01 00:00:00'),
(2, '骨科', 2, 'ORTHO001', '李主任', '骨科主任', '0', '专业从事骨科疾病的诊断和治疗', '2019-06-01 00:00:00'),
(3, '妇产科', 3, 'GYNO001', '王主任', '妇产科主任', '0', '专业从事妇产科疾病的诊断和治疗', '2018-03-01 00:00:00'),
(4, '儿科', 4, 'PEDIA001', '赵主任', '儿科主任', '0', '专业从事儿科疾病的诊断和治疗', '2020-09-01 00:00:00'),
(5, '急诊科', 5, 'EMERG001', '陈主任', '急诊科主任', '0', '24小时急诊医疗服务', '2017-01-01 00:00:00'),
(6, '影像科', 7, 'RADIO001', '刘主任', '影像科主任', '0', '医学影像检查和诊断', '2019-01-01 00:00:00'),
(7, '检验科', 8, 'LAB001', '周主任', '检验科主任', '0', '临床检验和病理诊断', '2018-01-01 00:00:00'),
(8, '药剂科', 9, 'PHARM001', '吴主任', '药剂科主任', '0', '药品管理和用药指导', '2017-06-01 00:00:00'),
(9, '护理部', 10, 'NURS001', '马护士长', '护理部主任', '0', '医院护理管理和服务', '2016-01-01 00:00:00'),
(10, '行政管理', 11, 'ADMIN001', '孙主任', '行政主任', '0', '医院行政管理工作', '2015-01-01 00:00:00');

-- 添加外键约束
ALTER TABLE `h_user_tb` 
ADD CONSTRAINT `fk_user_job_title` 
FOREIGN KEY (`jt_id`) REFERENCES `h_job_title_tb` (`jt_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `h_user_tb` 
ADD CONSTRAINT `fk_user_department` 
FOREIGN KEY (`department_id`) REFERENCES `h_department_tb` (`department_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 添加科室表与科室类型表的外键约束
ALTER TABLE `h_department_tb` 
ADD CONSTRAINT `fk_department_class` 
FOREIGN KEY (`dc_id`) REFERENCES `h_department_class` (`dc_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 创建视图：用户详细信息视图
CREATE VIEW `v_user_detail` AS
SELECT 
    u.user_id,
    u.work_number,
    u.username,
    CASE u.gender 
        WHEN 0 THEN '男' 
        WHEN 1 THEN '女' 
        ELSE '未知' 
    END AS gender_name,
    u.age,
    jt.jt_name AS title_name,
    d.department_name,
    d.department_code,
    dc.dc_name AS department_class_name,
    u.major_direct,
    u.phone,
    u.enter_date,
    CASE u.status 
        WHEN 0 THEN '在岗' 
        WHEN 1 THEN '休假' 
        WHEN 2 THEN '停职' 
        ELSE '未知' 
    END AS status_name,
    u.description,
    u.created_at,
    u.updated_at
FROM h_user_tb u
LEFT JOIN h_job_title_tb jt ON u.jt_id = jt.jt_id
LEFT JOIN h_department_tb d ON u.department_id = d.department_id
LEFT JOIN h_department_class dc ON d.dc_id = dc.dc_id;

-- 创建索引优化查询性能
CREATE INDEX `idx_user_gender_age` ON `h_user_tb` (`gender`, `age`);
CREATE INDEX `idx_user_created_at` ON `h_user_tb` (`created_at`);

-- 查询示例
-- 1. 查询所有用户详细信息
-- SELECT * FROM v_user_detail;

-- 2. 按科室查询用户
-- SELECT * FROM v_user_detail WHERE department_name = '心血管内科';

-- 3. 按职称查询用户
-- SELECT * FROM v_user_detail WHERE title_name = '主任医师';

-- 4. 查询在岗医生
-- SELECT * FROM v_user_detail WHERE status_name = '在岗';

-- 5. 按科室类型查询用户
-- SELECT * FROM v_user_detail WHERE department_class_name = '内科';

-- 6. 查询科室详细信息
-- SELECT d.*, dc.dc_name AS department_class_name 
-- FROM h_department_tb d 
-- LEFT JOIN h_department_class dc ON d.dc_id = dc.dc_id;

-- 7. 统计各科室人数
-- SELECT d.department_name, COUNT(u.user_id) AS user_count
-- FROM h_department_tb d
-- LEFT JOIN h_user_tb u ON d.department_id = u.department_id
-- GROUP BY d.department_id, d.department_name
-- ORDER BY user_count DESC;

-- 8. 统计各职称人数
-- SELECT jt.jt_name, COUNT(u.user_id) AS user_count
-- FROM h_job_title_tb jt
-- LEFT JOIN h_user_tb u ON jt.jt_id = u.jt_id
-- GROUP BY jt.jt_id, jt.jt_name
-- ORDER BY user_count DESC;
