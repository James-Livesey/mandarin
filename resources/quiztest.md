# Quiz testing page

<quiz-set>
    <quiz-page type="arrange">
        <quiz-question question="你叫什么名字？" after="我叫詹梓豪。">
            <quiz-block>我</quiz-block>
            <quiz-block>叫</quiz-block>
            <quiz-block>梓豪</quiz-block>
        </quiz-question>
        <quiz-question question="你好！">
            <quiz-block>你</quiz-block>
            <quiz-block>叫</quiz-block>
            <quiz-block>什么</quiz-block>
            <quiz-block>名字</quiz-block>
        </quiz-question>
    </quiz-page>
    <quiz-page type="pinyin">
        <quiz-question question="Transcribe: 你好吗？">nǐ · hǎo · ma?</quiz-question>
        <quiz-question question="Transcribe: 我很好">wǒ · hěn · hǎo</quiz-question>
    </quiz-page>
    <quiz-page type="match" directions="Match up the right boxes.">
        <quiz-block answer="Hello">你好</quiz-block>
        <quiz-block answer="I am good">我很好</quiz-block>
        <quiz-block answer="How are you">你好吗？</quiz-block>
    </quiz-page>
    <!-- <quiz-page type="draw">
        <quiz-question pinyin="wǒ">我</quiz-question>
        <quiz-question pinyin="nǐ">你</quiz-question>
    </quiz-page> -->
</quiz-set>