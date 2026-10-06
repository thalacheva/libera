import Theorem from '~/Theorem';
import { InteractiveTriangle } from './InteractiveTriangle';

export function Triangle() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Основни свойства на триъгълника
        </h1>
        <Theorem
          title="Теорема 1. Сума на ъглите в триъгълник"
          description="Сборът на трите вътрешни ъгъла в триъгълник е равен на 180°."
          graphic={<InteractiveTriangle type="angles" />}
        />
        <Theorem
          title="Теорема 2. Външен ъгъл на триъгълник"
          description="Външният ъгъл при даден връх е равен на сбора от двата срещулежащи вътрешни ъгъла."
          graphic={<InteractiveTriangle type="exterior" />}
        />
        <Theorem
          title="Теорема 3. Неравенство на триъгълника"
          description="Всяка страна на триъгълник е по-малка от сбора на другите две"
          graphic={<InteractiveTriangle type="inequality" />}
        />
      </div>
    </main>
  );
}
