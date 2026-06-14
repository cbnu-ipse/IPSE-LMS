from django.test import TestCase
from django.contrib.auth import get_user_model
from accounts.models import LeafTransaction

User = get_user_model()

class LeafCurrencyTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="teststudent",
            password="testpassword123",
            first_name="Gildong",
            last_name="Hong"
        )

    def test_default_leaves_is_zero(self):
        """사용자 생성 시 기본 낙엽 수량은 0이어야 함"""
        self.assertEqual(self.user.leaves, 0)

    def test_adjust_leaves_gain(self):
        """낙엽 획득 시 잔고 증가 및 해시 무결성 검증"""
        self.user.adjust_leaves(10, "quiz_reward", "퀴즈 보상")
        
        # 유저 캐시 필드 갱신 확인
        self.user.refresh_from_db()
        self.assertEqual(self.user.leaves, 10)
        
        # 트랜잭션 생성 및 해시 확인
        tx = LeafTransaction.objects.filter(user=self.user).first()
        self.assertIsNotNone(tx)
        self.assertEqual(tx.amount, 10)
        self.assertEqual(tx.transaction_type, "quiz_reward")
        self.assertEqual(tx.previous_hash, "genesis")
        self.assertEqual(tx.hash, tx.calculate_hash())

    def test_adjust_leaves_deduct_success(self):
        """낙엽 소비 시 잔고 차감 및 체인 해시 무결성 검증"""
        # 먼저 획득
        self.user.adjust_leaves(20, "bonus", "최초 지급")
        
        # 소비
        self.user.adjust_leaves(-8, "consume", "아이템 구매")
        self.user.refresh_from_db()
        self.assertEqual(self.user.leaves, 12)
        
        transactions = list(LeafTransaction.objects.filter(user=self.user).order_by('created_at'))
        self.assertEqual(len(transactions), 2)
        
        tx1, tx2 = transactions[0], transactions[1]
        
        # 두 번째 트랜잭션의 previous_hash가 첫 번째 트랜잭션의 hash를 가리키는지 확인
        self.assertEqual(tx2.previous_hash, tx1.hash)
        self.assertEqual(tx2.hash, tx2.calculate_hash())

    def test_adjust_leaves_insufficient_balance(self):
        """잔액 부족 시 ValueError 예외 발생 및 트랜잭션 생성 차단"""
        self.user.adjust_leaves(5, "bonus", "지급")
        
        with self.assertRaises(ValueError):
            self.user.adjust_leaves(-10, "consume", "과소비")
            
        self.user.refresh_from_db()
        # 잔액이 롤백되어 5개로 유지되어야 함
        self.assertEqual(self.user.leaves, 5)
        
        # 에러 유발 트랜잭션이 저장되지 않았는지 확인
        tx_count = LeafTransaction.objects.filter(user=self.user).count()
        self.assertEqual(tx_count, 1)

    def test_transaction_immutability(self):
        """기록된 거래 기록을 수정(Update)하려고 할 때 PermissionError 발생 검증"""
        self.user.adjust_leaves(15, "bonus", "지급")
        tx = LeafTransaction.objects.filter(user=self.user).first()
        
        with self.assertRaises(PermissionError):
            tx.amount = 50
            tx.save()
            
        # 데이터베이스의 값이 변경되지 않았는지 재확인
        tx.refresh_from_db()
        self.assertEqual(tx.amount, 15)
