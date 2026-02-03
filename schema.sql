-- TaxLawStudy 테이블: 각 파트별 주제와 학습 횟수 관리
CREATE TABLE IF NOT EXISTS TaxLawStudy (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    part INTEGER NOT NULL, -- 1부터 8까지의 파트
    topic TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    last_date TEXT
);

-- StudyLog 테이블: 학습 기록 저장
CREATE TABLE IF NOT EXISTS StudyLog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    part INTEGER NOT NULL,
    topic TEXT NOT NULL,
    dodate TEXT NOT NULL
);

-- CurrentTodoList 테이블: 현재 유지 중인 To-Do 리스트 저장
CREATE TABLE IF NOT EXISTS CurrentTodoList (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    FOREIGN KEY (topic_id) REFERENCES TaxLawStudy(id)
);

-- 초기 데이터 예시 (사용자가 실제 데이터를 넣기 전 테스트용)
INSERT INTO TaxLawStudy (part, topic, count) VALUES 
(1, '조세총론 1', 0), (1, '조세총론 2', 0),
(2, '국세기본법 1', 0), (2, '국세기본법 2', 0),
(3, '법인세법 1', 0), (3, '법인세법 2', 0),
(4, '소득세법 1', 0), (4, '소득세법 2', 0),
(5, '부가가치세법 1', 0), (5, '부가가치세법 2', 0),
(6, '상속증여세법 1', 0), (6, '상속증여세법 2', 0),
(7, '지방세법 1', 0), (7, '지방세법 2', 0),
(8, '국세징수법 1', 0), (8, '국세징수법 2', 0);
