<?php

use Grido\Components\Filters\Filter,
    Nette\Utils\Html;

/**
 * Dibi example.
 *
 * @package     Grido
 * @author      Petr Bugyík
 */
final class DoctrinePresenter extends BasePresenter
{
    protected function createComponentGrid($name)
    {
        $grid = new Grido\Grid($this, $name);

        $repository = $this->context->doctrine->entityManager->getRepository('Entities\User');
        $grid->setModel($repository->createQueryBuilder('a'));

        $grid->addColumnText('firstname', 'Firstname')
            ->setFilterText()
                ->setSuggestion();

        $grid->addColumnText('surname', 'Surname')
            ->setSortable()
            ->setFilterText()
                ->setSuggestion();

        $grid->addColumnText('gender', 'Gender')
            ->setSortable()
            ->cellPrototype->class[] = 'center';

        $grid->addColumnDate('birthday', 'Birthday', Grido\Components\Columns\Date::FORMAT_TEXT)
            ->setSortable()
            ->setFilterDate()
                ->setCondition(Filter::CONDITION_CALLBACK, callback($this, 'gridBirthdayFilterCondition'));
        $grid->getColumn('birthday')->cellPrototype->class[] = 'center';

        $baseUri = $this->template->baseUri;
        $grid->addColumnText('country', 'Country')
            ->setSortable()
            ->setCustomRender(function($item) use($baseUri) {
                $img = Html::el('img')->src("$baseUri/img/flags/$item->country_code.gif");
                return "$img $item->country";
            })
            ->setFilterText()
                ->setSuggestion();

        $grid->addColumnText('card', 'Card')
            ->setSortable()
            ->setColumn('cctype') //name of db column
            ->setReplacement(array('MasterCard' => Html::el('b')->setText('MasterCard')))
            ->cellPrototype->class[] = 'center';

        $grid->addColumnMail('emailaddress', 'Email')
            ->setSortable()
            ->setFilterText();
        $grid->getColumn('emailaddress')->cellPrototype->class[] = 'center';

        $grid->addColumnText('centimeters', 'Height')
            ->setSortable()
            ->setFilterNumber();
        $grid->getColumn('centimeters')->cellPrototype->class[] = 'center';

        $grid->addFilterSelect('gender', 'Gender', array(
            '' => '',
            'female' => 'female',
            'male' => 'male'
        ));

        $grid->addFilterSelect('card', 'Card', array(
                '' => '',
                'MasterCard' => 'MasterCard',
                'Visa' => 'Visa'
            ))
            ->setColumn('cctype');

        $grid->addActionHref('edit', 'Edit')
            ->setIcon('pencil');

        $grid->addFilterCheck('preferred', 'Only preferred girls :)')
            ->setCondition(Filter::CONDITION_CUSTOM, array(
                TRUE => '[gender] = \'female\' AND [centimeters] >= 170' //for checked
        ));

        $grid->addActionHref('delete', 'Delete')
            ->setIcon('trash')
            ->setConfirm(function($item) {
                return "Are you sure you want to delete {$item->firstname} {$item->surname}?";
        });

        $operations = array('print' => 'Print', 'delete' => 'Delete');
        $grid->setOperations($operations, callback($this, 'gridOperationsHandler'))
            ->setConfirm('delete', 'Are you sure you want to delete %i items?');

        $grid->setFilterRenderType($this->filterRenderType);
        $grid->setExporting();
    }
}
