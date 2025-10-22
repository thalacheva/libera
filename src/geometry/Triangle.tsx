import Theorem from '~/Theorem';
import InteractiveTriangle from './InteractiveTriangle';

export default function Triangle() {
  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">
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
    </main>
  );
}
