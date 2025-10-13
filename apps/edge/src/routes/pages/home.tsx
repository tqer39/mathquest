import type { FC } from 'hono/jsx';
import type { CurrentUser } from '../../application/session/current-user';

const HomeNav: FC<{ currentUser: CurrentUser | null }> = ({ currentUser }) => (
  <nav class="flex flex-col gap-3 rounded-3xl border border-[var(--mq-outline)] bg-[var(--mq-surface)] px-6 py-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
    <div class="flex items-center gap-3">
      <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--mq-primary-soft)] text-base font-bold text-[var(--mq-primary-strong)]">
        MQ
      </span>
      <span class="text-lg font-semibold tracking-tight text-[var(--mq-ink)]">
        MathQuest
      </span>
    </div>
    <div class="flex items-center gap-3 sm:gap-4">
      <p class="hidden text-sm font-medium text-[#5e718a] sm:block">
        小学生の算数を、遊ぶように練習しよう
      </p>
      {currentUser ? (
        <>
          <span class="hidden text-sm font-semibold text-[var(--mq-ink)] sm:inline-flex sm:items-center sm:gap-2">
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold text-white"
              style={`background:${currentUser.avatarColor}`}
            >
              {currentUser.displayName.slice(0, 1)}
            </span>
            {currentUser.displayName}
          </span>
          <a
            href="/auth/logout"
            class="inline-flex items-center gap-2 rounded-2xl border border-[var(--mq-outline)] bg-white px-3 py-2 text-xs font-semibold text-[var(--mq-ink)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-soft)] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mq-primary)]"
          >
            ログアウト
          </a>
        </>
      ) : (
        <a
          href="/auth/login"
          class="inline-flex items-center gap-2 rounded-2xl border border-[var(--mq-outline)] bg-white px-3 py-2 text-xs font-semibold text-[var(--mq-ink)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-soft)] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mq-primary)]"
        >
          ログイン
        </a>
      )}
    </div>
  </nav>
);

export const Home: FC<{ currentUser: CurrentUser | null }> = ({
  currentUser,
}) => (
  <div
    id="home-root"
    class="flex min-h-screen w-full flex-col gap-10 px-4 py-8 sm:px-8 lg:px-16 xl:px-24"
    data-user-state={
      currentUser
        ? currentUser.id.startsWith('guest-')
          ? 'guest'
          : 'member'
        : 'none'
    }
  >
    <HomeNav currentUser={currentUser} />

    <header class="flex flex-col gap-6 rounded-3xl border border-[var(--mq-outline)] bg-gradient-to-r from-[var(--mq-primary-soft)] via-white to-[var(--mq-accent)] p-8 text-[var(--mq-ink)] shadow-xl lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-4">
        <p class="text-xs font-semibold uppercase tracking-[0.4em] text-[#6c7c90]">
          じぶんのペースで算数練習
        </p>
        <h1 class="text-3xl font-extrabold sm:text-4xl">MathQuest</h1>
        <p class="max-w-xl text-sm sm:text-base text-[#4f6076]">
          匿名のまま「すぐにはじめる」を押して学年を選ぶだけ。学習記録はブラウザに保存され、会員登録をすればクラウドにも同期できます。
        </p>
        <ul class="space-y-1 text-sm text-[#4f6076]">
          <li>・学年別のおすすめ単元からスタート</li>
          <li>・効果音や途中式の表示などをまとめてカスタマイズ</li>
          <li>・3,2,1,Go! のカウントダウンで集中モードに突入</li>
        </ul>
      </div>
      <a
        href="/start"
        class="inline-flex items-center justify-center rounded-2xl bg-[var(--mq-primary)] px-6 py-3 text-lg font-semibold text-[var(--mq-ink)] shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-strong)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mq-primary-strong)]"
      >
        すぐにはじめる
      </a>
    </header>

    <section class="grid gap-6 rounded-3xl border border-[var(--mq-outline)] bg-[var(--mq-surface)] px-6 py-8 text-[var(--mq-ink)] shadow-lg md:grid-cols-3">
      <div class="space-y-2">
        <h2 class="text-xl font-semibold">学年プリセット</h2>
        <p class="text-sm text-[#5e718a]">
          1年生から6年生まで、学習指導要領をベースにした単元プリセットを用意しています。学年にあわせた難易度からスタートしましょう。
        </p>
      </div>
      <div class="space-y-2">
        <h2 class="text-xl font-semibold">カスタム設定</h2>
        <p class="text-sm text-[#5e718a]">
          効果音・途中式・集中モードの ON/OFF と初期問題数を 1
          画面でまとめて調整できます。設定はブラウザに保存され、次回も引き継がれます。
        </p>
      </div>
      <div class="space-y-2">
        <h2 class="text-xl font-semibold">集中して解く</h2>
        <p class="text-sm text-[#5e718a]">
          設定が完了したら 3,2,1,Go!
          のカウントダウンで集中タイムへ。テンキーと途中式表示で、紙を使わなくても手軽に練習できます。
        </p>
      </div>
    </section>
  </div>
);
